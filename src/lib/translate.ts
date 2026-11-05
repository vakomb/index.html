/**
 * Transparent translation filter — Polish ⇄ Lithuanian.
 *
 * Every upstream string (titles, descriptions, parameter names/values) passes
 * through `translateBatch()` before it reaches a component. Providers:
 *
 *  • glossary — offline, deterministic. Exact phrase memory + term glossary.
 *               Default; powers the mock catalogue with zero setup.
 *  • deepl    — DeepL API (supports PL and LT natively).
 *  • openai   — any OpenAI-compatible chat endpoint. Point OPENAI_BASE_URL at
 *               Ollama / LM Studio for a fully local model.
 *
 * Results are memoised in-process. Any provider failure degrades gracefully
 * to the glossary, then to the source text, so rendering never breaks.
 */
import { config } from "./config";
import { MOCK_PHRASES } from "./allegro/mock";

type Lang = "pl" | "lt";

/* ───────────────────────────── Glossary ───────────────────────────── */

/** Parameter names & values and common catalogue terms (PL → LT). */
const TERMS: Array<[string, string]> = [
  ["Stan", "Būklė"], ["Nowy", "Nauja"], ["Marka", "Prekės ženklas"], ["Gwarancja", "Garantija"],
  ["24 miesiące", "24 mėnesiai"], ["12 miesięcy", "12 mėnesių"], ["Kolor", "Spalva"], ["Rozmiar", "Dydis"],
  ["Czarny", "Juoda"], ["Biały", "Balta"], ["Szary", "Pilka"], ["Granatowy", "Tamsiai mėlyna"],
  ["Beżowy", "Smėlio"], ["Ciepła biel", "Šilta balta"], ["Materiał", "Medžiaga"], ["Wełna merino", "Merino vilna"],
  ["Moc", "Galia"], ["Pojemność", "Talpa"], ["Waga", "Svoris"], ["Zasilanie", "Maitinimas"],
  ["Akumulatorowe", "Akumuliatorinis"], ["Sieciowe", "Iš elektros tinklo"],
];

/** Search vocabulary (LT → PL) used to translate customer queries in live mode. */
const QUERY_TERMS: Array<[lt: string, pl: string]> = [
  ["ausinės", "słuchawki"], ["baterija", "powerbank"], ["laikrodis", "zegarek"], ["klaviatūra", "klawiatura"],
  ["televizorius", "telewizor"], ["įkroviklis", "ładowarka"], ["telefonas", "telefon"], ["kompiuteris", "laptop"],
  ["striukė", "kurtka"], ["megztinis", "sweter"], ["batai", "buty"], ["kepurė", "czapka"], ["kuprinė", "plecak"],
  ["apatiniai", "bielizna"], ["siurblys", "odkurzacz"], ["gruzdintuvė", "frytkownica"], ["girlianda", "lampki"],
  ["vejapjovė", "kosiarka"], ["antklodė", "koc"], ["peiliai", "noże"], ["padangos", "opony"],
  ["registratorius", "wideorejestrator"], ["valytuvai", "wycieraczki"], ["grandiklis", "skrobaczka"],
  ["kompresorius", "kompresor"], ["hanteliai", "hantle"], ["akiniai", "gogle"], ["kilimėlis", "mata"],
  ["dviratis", "rower"], ["termosas", "termos"], ["palapinė", "namiot"], ["šepetėlis", "szczoteczka"],
  ["džiovintuvas", "suszarka"], ["kremas", "krem"], ["drėkintuvas", "nawilżacz"], ["masažuoklis", "masażer"],
  ["svarstyklės", "waga"], ["žieminis", "zimowy"], ["žieminė", "zimowa"], ["belaidis", "bezprzewodowy"],
  ["belaidės", "bezprzewodowe"], ["juoda", "czarny"], ["balta", "biały"],
];

const phraseMemory = new Map<string, string>([...MOCK_PHRASES, ...TERMS]);

function glossaryTranslate(text: string, from: Lang, to: Lang): string {
  if (from === "pl" && to === "lt") return phraseMemory.get(text) ?? text;
  if (from === "lt" && to === "pl") {
    return text
      .split(/\s+/)
      .map((word) => {
        const hit = QUERY_TERMS.find(([lt]) => normalize(lt) === normalize(word));
        return hit ? hit[1] : word;
      })
      .join(" ");
  }
  return text;
}

/* ──────────────────────────── AI providers ──────────────────────────── */

async function deepl(texts: string[], from: Lang, to: Lang): Promise<string[]> {
  const key = config.translation.deeplKey;
  const host = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const res = await fetch(`${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts, source_lang: from.toUpperCase(), target_lang: to.toUpperCase(), formality: "prefer_more" }),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}`);
  const json = (await res.json()) as { translations: Array<{ text: string }> };
  return json.translations.map((t) => t.text);
}

async function openai(texts: string[], from: Lang, to: Lang): Promise<string[]> {
  const names: Record<Lang, string> = { pl: "Polish", lt: "Lithuanian" };
  const res = await fetch(`${config.translation.openaiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.translation.openaiKey ? { Authorization: `Bearer ${config.translation.openaiKey}` } : {}),
    },
    body: JSON.stringify({
      model: config.translation.openaiModel,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `You are a professional e-commerce localiser. Translate each string from ${names[from]} to ${names[to]}. ` +
            `Write fluent, premium retail copy. Keep brand names, model numbers and units unchanged. ` +
            `Reply with JSON {"t": [...]} containing exactly ${texts.length} strings in the same order.`,
        },
        { role: "user", content: JSON.stringify(texts) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const content = json.choices[0]?.message?.content ?? "";
  const parsed = JSON.parse(content.slice(content.indexOf("{"), content.lastIndexOf("}") + 1)) as { t: unknown };
  if (!Array.isArray(parsed.t) || parsed.t.length !== texts.length) throw new Error("LLM returned malformed batch");
  return parsed.t.map(String);
}

/* ───────────────────────────── Public API ───────────────────────────── */

const MAX_CACHE = 10_000;
const cache = new Map<string, string>();

export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Translates a batch of strings, preserving order. Never throws. */
export async function translateBatch(texts: string[], from: Lang = "pl", to: Lang = "lt"): Promise<string[]> {
  const key = (t: string) => `${from}>${to}:${t}`;
  const pending = [...new Set(texts.filter((t) => t && !cache.has(key(t))))];

  if (pending.length > 0) {
    let results: string[] | null = null;
    const provider = config.translation.provider;
    try {
      if (provider === "deepl" && config.translation.deeplKey) results = await deepl(pending, from, to);
      else if (provider === "openai") results = await openai(pending, from, to);
    } catch (err) {
      console.warn(`[translate] ${provider} failed, using glossary:`, (err as Error).message);
    }
    results ??= pending.map((t) => glossaryTranslate(t, from, to));

    if (cache.size + pending.length > MAX_CACHE) cache.clear();
    pending.forEach((t, i) => cache.set(key(t), results![i] || t));
  }

  return texts.map((t) => (t ? cache.get(key(t)) ?? t : t));
}

export async function translateQueryToPolish(query: string): Promise<string> {
  const [pl] = await translateBatch([query], "lt", "pl");
  return pl;
}

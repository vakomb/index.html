/**
 * Monochrome SVG product imagery for the mock catalogue.
 * Deterministic per offer id + variant, cached aggressively by the browser.
 */
import { mockOfferMeta } from "@/lib/allegro/mock";
import type { CategorySlug } from "@/lib/types";

const GLYPHS: Record<CategorySlug, string> = {
  elektronika: '<rect x="150" y="150" width="100" height="100" rx="14"/><path d="M175 120v30M225 120v30M175 250v30M225 250v30M120 175h30M120 225h30M250 175h30M250 225h30"/>',
  drabuziai: '<path d="M170 110l-62 34 24 54 30-14V300h116V184l30 14 24-54-62-34a38 38 0 0 1-76 0z"/>',
  "namai-ir-sodas": '<path d="M112 290c0-108 66-182 186-188-6 120-80 188-186 188z"/><path d="M112 290l94-94"/>',
  autodalys: '<circle cx="200" cy="200" r="40"/><path d="M200 90v30M200 280v30M90 200h30M280 200h30M122 122l22 22M256 256l22 22M122 278l22-22M256 144l22-22"/>',
  sportas: '<circle cx="200" cy="200" r="100"/><path d="M106 166c52 20 136 20 188 0M106 234c52-20 136-20 188 0M200 100c-32 52-32 148 0 200"/>',
  grozis: '<path d="M200 96c46 58 80 102 80 144a80 80 0 0 1-160 0c0-42 34-86 80-144z"/>',
};

const TONES = ["#f4f4f5", "#efefef", "#f7f7f7"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variant = Number(new URL(request.url).searchParams.get("v") ?? 0) % 3;
  const meta = mockOfferMeta(id);
  const glyph = meta ? GLYPHS[meta.category] : GLYPHS.elektronika;
  const brand = (meta?.brand ?? "Lenkynas").replace(/[<>&"]/g, "");
  const rotate = [0, -8, 8][variant];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <rect width="400" height="400" fill="${TONES[variant]}"/>
  <g transform="rotate(${rotate} 200 200)" fill="none" stroke="#0a0a0a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.88">${glyph}</g>
  <text x="200" y="356" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="600" letter-spacing="3" fill="#a3a3a3">${brand.toUpperCase()}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

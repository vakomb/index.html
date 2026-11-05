/**
 * Mock Allegro middleware.
 *
 * Simulates the normalised payload of the Allegro REST API so the whole
 * storefront works offline right after `npm run dev`. The raw offers are
 * intentionally Polish-only and PLN-denominated — exactly like the real
 * upstream — so the translation, FX, markup and logistics filters are
 * exercised end-to-end.
 *
 * Six offers have no Lithuanian shipping option (pallet freight or
 * domestic-only carriers). The logistics filter must suppress them.
 */
import type { AllegroParameter, AllegroRawOffer, AllegroShippingRate, CategorySlug } from "../types";

/* ─────────────────────────── Shipping presets ─────────────────────────── */

const SHIPPING: Record<string, AllegroShippingRate[]> = {
  /** Fast EU dispatch: DPD + InPost International reach LT. */
  euFast: [
    { countryCode: "PL", carrier: "InPost Paczkomat 24/7", deliveryTime: "1 dzień", pricePln: 9.99 },
    { countryCode: "LT", carrier: "DPD", deliveryTime: "PT48H/PT96H", pricePln: 34.99 },
    { countryCode: "LT", carrier: "InPost International", deliveryTime: "3-5 dni robocze", pricePln: 29.99 },
  ],
  /** Standard EU dispatch via GLS. */
  euStd: [
    { countryCode: "PL", carrier: "Allegro One Box", deliveryTime: "PT24H/PT48H", pricePln: 8.99 },
    { countryCode: "LT", carrier: "GLS", deliveryTime: "3–5 dni", pricePln: 39.0 },
  ],
  /** DHL Parcel Connect, slightly slower. */
  euDhl: [
    { countryCode: "PL", carrier: "DPD Kurier", deliveryTime: "1 dzień", pricePln: 14.99 },
    { countryCode: "LT", carrier: "DHL Parcel", deliveryTime: "PT96H/PT144H", pricePln: 45.0 },
  ],
  /** Domestic only — must be suppressed. */
  plOnly: [
    { countryCode: "PL", carrier: "InPost Paczkomat 24/7", deliveryTime: "1 dzień", pricePln: 9.99 },
    { countryCode: "PL", carrier: "DPD Kurier", deliveryTime: "1-2 dni", pricePln: 16.99 },
  ],
  /** Pallet freight inside Poland only — must be suppressed. */
  plPallet: [{ countryCode: "PL", carrier: "Przesyłka paletowa", deliveryTime: "3-5 dni robocze", pricePln: 149.0 }],
};

/* ─────────────────────────────── Seed rows ─────────────────────────────── */

interface Seed {
  id: string;
  cat: CategorySlug;
  pricePln: number;
  beforePln?: number;
  ship: keyof typeof SHIPPING;
  pop: number;
  tags?: Array<"top" | "seasonal">;
  seller: string;
  superSeller?: boolean;
  stock?: number;
  brand: string;
  extra?: Array<[string, string]>;
  pl: [name: string, description: string];
  lt: [name: string, description: string];
}

const SEEDS: Seed[] = [
  /* Elektronika */
  {
    id: "15734920115", cat: "elektronika", pricePln: 1199, beforePln: 1549, ship: "euFast", pop: 1840, tags: ["top"],
    seller: "audio-centrum", superSeller: true, brand: "Sony", extra: [["Kolor", "Czarny"]],
    pl: ["Słuchawki bezprzewodowe Sony WH-1000XM5 z ANC, czarne", "Flagowe słuchawki nauszne z aktywną redukcją szumów, do 30 godzin pracy na baterii i szybkim ładowaniem USB-C."],
    lt: ["Belaidės ausinės Sony WH-1000XM5 su ANC, juodos", "Flagmanės apgaubiančios ausinės su aktyviu triukšmo slopinimu, iki 30 valandų veikimo vienu įkrovimu ir greituoju USB-C įkrovimu."],
  },
  {
    id: "15822740331", cat: "elektronika", pricePln: 189, beforePln: 229, ship: "euFast", pop: 2210, tags: ["top"],
    seller: "power-hub", superSeller: true, brand: "Anker", extra: [["Pojemność", "20000 mAh"]],
    pl: ["Powerbank Anker 20000 mAh USB-C PD 30 W", "Pojemny powerbank z szybkim ładowaniem Power Delivery, naładuje smartfon nawet pięć razy."],
    lt: ["Išorinė baterija Anker 20000 mAh USB-C PD 30 W", "Talpi išorinė baterija su greituoju Power Delivery įkrovimu – išmanųjį telefoną įkraus net penkis kartus."],
  },
  {
    id: "14990213877", cat: "elektronika", pricePln: 399, beforePln: 499, ship: "euStd", pop: 1320,
    seller: "mi-store-pl", brand: "Xiaomi", extra: [["Kolor", "Czarny"]],
    pl: ["Smartwatch Xiaomi Redmi Watch 4, GPS, AMOLED", "Lekki zegarek z ekranem AMOLED 1,97\", wbudowanym GPS i do 20 dni pracy na baterii."],
    lt: ["Išmanusis laikrodis Xiaomi Redmi Watch 4, GPS, AMOLED", "Lengvas laikrodis su 1,97\" AMOLED ekranu, integruotu GPS ir iki 20 dienų veikimo be įkrovimo."],
  },
  {
    id: "16004517292", cat: "elektronika", pricePln: 289, ship: "euDhl", pop: 640,
    seller: "keyboard-lab", brand: "Keychron", extra: [["Kolor", "Szary"]],
    pl: ["Klawiatura mechaniczna bezprzewodowa, przełączniki Brown, układ US", "Kompaktowa klawiatura 75% z łącznością Bluetooth 5.1 i 2,4 GHz oraz podświetleniem RGB."],
    lt: ["Belaidė mechaninė klaviatūra, Brown jungikliai, US išdėstymas", "Kompaktiška 75 % klaviatūra su Bluetooth 5.1 ir 2,4 GHz ryšiu bei RGB apšvietimu."],
  },
  {
    id: "15561100940", cat: "elektronika", pricePln: 2899, beforePln: 3399, ship: "plPallet", pop: 980,
    seller: "rtv-magazyn", brand: "TCL",
    pl: ["Telewizor 65\" 4K QLED Smart TV", "Duży telewizor QLED z HDR10+ i systemem Google TV."],
    lt: ["Televizorius 65\" 4K QLED Smart TV", "Didelis QLED televizorius su HDR10+ ir Google TV sistema."],
  },
  {
    id: "16120058413", cat: "elektronika", pricePln: 119, beforePln: 149, ship: "euFast", pop: 1980, tags: ["top"],
    seller: "power-hub", superSeller: true, brand: "Baseus", extra: [["Moc", "65 W"]],
    pl: ["Ładowarka sieciowa GaN 65 W, 3 porty", "Kompaktowa ładowarka GaN do laptopa, tabletu i telefonu jednocześnie."],
    lt: ["Tinklo įkroviklis GaN 65 W, 3 jungtys", "Kompaktiškas GaN įkroviklis nešiojamajam kompiuteriui, planšetei ir telefonui vienu metu."],
  },

  /* Drabužiai */
  {
    id: "15377281024", cat: "drabuziai", pricePln: 459, beforePln: 599, ship: "euStd", pop: 1450, tags: ["top", "seasonal"],
    seller: "nord-outdoor", superSeller: true, brand: "Nordwear", extra: [["Rozmiar", "L"], ["Kolor", "Czarny"]],
    pl: ["Kurtka zimowa męska puchowa z kapturem, czarna", "Ciepła kurtka z naturalnym puchem, wodoodporną powłoką i regulowanym kapturem."],
    lt: ["Vyriška žieminė pūkinė striukė su gobtuvu, juoda", "Šilta striukė su natūraliais pūkais, vandeniui atspariu paviršiumi ir reguliuojamu gobtuvu."],
  },
  {
    id: "15910036675", cat: "drabuziai", pricePln: 129, beforePln: 169, ship: "euFast", pop: 870, tags: ["seasonal"],
    seller: "sport-tekstil", brand: "Thermo+", extra: [["Rozmiar", "M"], ["Kolor", "Czarny"]],
    pl: ["Bielizna termoaktywna damska komplet", "Oddychający komplet na narty i zimowe treningi, szybko odprowadza wilgoć."],
    lt: ["Moteriškas termoaktyvių apatinių komplektas", "Kvėpuojantis komplektas slidinėjimui ir žiemos treniruotėms, greitai pašalina drėgmę."],
  },
  {
    id: "14872294150", cat: "drabuziai", pricePln: 349, ship: "euDhl", pop: 520,
    seller: "gory-sklep", brand: "Trekline", extra: [["Rozmiar", "39"], ["Kolor", "Szary"]],
    pl: ["Buty trekkingowe damskie wodoodporne", "Lekkie buty z membraną i antypoślizgową podeszwą do górskich wędrówek."],
    lt: ["Moteriški neperšlampami žygio batai", "Lengvi batai su membrana ir neslystančiu padu žygiams kalnuose."],
  },
  {
    id: "16233901288", cat: "drabuziai", pricePln: 239, beforePln: 299, ship: "euStd", pop: 610, tags: ["seasonal"],
    seller: "nord-outdoor", superSeller: true, brand: "Nordwear", extra: [["Rozmiar", "L"], ["Kolor", "Granatowy"], ["Materiał", "Wełna merino"]],
    pl: ["Sweter męski z wełny merino, granatowy", "Miękki sweter z czystej wełny merino, idealny na chłodne dni."],
    lt: ["Vyriškas merino vilnos megztinis, tamsiai mėlynas", "Minkštas grynos merino vilnos megztinis, puikiai tinkantis vėsioms dienoms."],
  },
  {
    id: "15140077819", cat: "drabuziai", pricePln: 59, ship: "plOnly", pop: 740, tags: ["seasonal"],
    seller: "dzianina-pl", brand: "Wool&Co", extra: [["Kolor", "Beżowy"]],
    pl: ["Czapka zimowa z pomponem, beżowa", "Ciepła czapka z dzianiny z polarową podszewką."],
    lt: ["Žieminė kepurė su bumbulu, smėlio spalvos", "Šilta megzta kepurė su flisiniu pamušalu."],
  },
  {
    id: "16055412906", cat: "drabuziai", pricePln: 199, beforePln: 249, ship: "euFast", pop: 930, tags: ["top"],
    seller: "urban-bags", brand: "Urbanpack", extra: [["Pojemność", "25 l"], ["Kolor", "Czarny"]],
    pl: ["Plecak miejski 25 l z przegrodą na laptop", "Wodoodporny plecak z ukrytą kieszenią i portem USB."],
    lt: ["Miesto kuprinė 25 l su skyriumi nešiojamajam kompiuteriui", "Vandeniui atspari kuprinė su paslėpta kišene ir USB jungtimi."],
  },

  /* Namai ir sodas */
  {
    id: "15488813320", cat: "namai-ir-sodas", pricePln: 649, beforePln: 849, ship: "euDhl", pop: 1720, tags: ["top"],
    seller: "agd-premium", superSeller: true, brand: "Dreame", extra: [["Zasilanie", "Akumulatorowe"]],
    pl: ["Odkurzacz pionowy bezprzewodowy 2w1, 25 kPa", "Mocny odkurzacz z filtrem HEPA, wyświetlaczem LED i czasem pracy do 60 minut."],
    lt: ["Belaidis vertikalus dulkių siurblys 2 viename, 25 kPa", "Galingas dulkių siurblys su HEPA filtru, LED ekranu ir iki 60 minučių veikimo laiku."],
  },
  {
    id: "15999304417", cat: "namai-ir-sodas", pricePln: 329, beforePln: 429, ship: "euStd", pop: 2480, tags: ["top"],
    seller: "agd-premium", superSeller: true, brand: "Cosori", extra: [["Pojemność", "5,5 l"], ["Kolor", "Czarny"]],
    pl: ["Frytkownica beztłuszczowa 5,5 l z oknem", "Frytkownica na gorące powietrze z ośmioma programami i podglądem pieczenia."],
    lt: ["Karšto oro gruzdintuvė 5,5 l su langeliu", "Karšto oro gruzdintuvė su aštuoniomis programomis ir galimybe stebėti kepimą."],
  },
  {
    id: "16177720534", cat: "namai-ir-sodas", pricePln: 79, beforePln: 99, ship: "euFast", pop: 1350, tags: ["seasonal"],
    seller: "swiatla-dekor", brand: "Lumio", extra: [["Kolor", "Ciepła biel"]],
    pl: ["Lampki choinkowe LED 20 m, ciepła biel", "Girlanda z 200 diodami LED, ośmioma trybami świecenia i timerem."],
    lt: ["Kalėdinė LED girlianda 20 m, šilta balta", "Girlianda su 200 LED lempučių, aštuoniais švietimo režimais ir laikmačiu."],
  },
  {
    id: "15602281173", cat: "namai-ir-sodas", pricePln: 1399, ship: "plPallet", pop: 260,
    seller: "ogrod-maszyny", brand: "GardenPro",
    pl: ["Kosiarka spalinowa z napędem 46 cm", "Kosiarka z napędem na tylne koła i koszem 60 l."],
    lt: ["Benzininė savaeigė vejapjovė 46 cm", "Vejapjovė su galinių ratų pavara ir 60 l žolės surinkimo krepšiu."],
  },
  {
    id: "15734102269", cat: "namai-ir-sodas", pricePln: 189, beforePln: 239, ship: "euStd", pop: 760, tags: ["seasonal"],
    seller: "dom-cieplo", brand: "Warmly", extra: [["Kolor", "Szary"], ["Zasilanie", "Sieciowe"]],
    pl: ["Koc elektryczny podgrzewany 160×130 cm", "Miękki koc z sześcioma poziomami grzania i automatycznym wyłączaniem."],
    lt: ["Elektrinė šildoma antklodė 160×130 cm", "Minkšta antklodė su šešiais šildymo lygiais ir automatiniu išsijungimu."],
  },
  {
    id: "16088813942", cat: "namai-ir-sodas", pricePln: 219, beforePln: 279, ship: "euFast", pop: 540,
    seller: "kuchnia-pro", brand: "Klinge",
    pl: ["Zestaw noży kuchennych ze stali nierdzewnej, 6 el.", "Ostre noże w drewnianym bloku, odporne na korozję."],
    lt: ["Nerūdijančio plieno virtuvinių peilių rinkinys, 6 vnt.", "Aštrūs peiliai mediniame stove, atsparūs korozijai."],
  },

  /* Autodalys */
  {
    id: "15211198454", cat: "autodalys", pricePln: 1240, ship: "plOnly", pop: 1100, tags: ["seasonal"],
    seller: "opony-24", brand: "Dębica", extra: [["Rozmiar", "205/55 R16"]],
    pl: ["Opony zimowe 205/55 R16, komplet 4 szt.", "Komplet opon zimowych o dobrej przyczepności na śniegu."],
    lt: ["Žieminės padangos 205/55 R16, 4 vnt. komplektas", "Žieminių padangų komplektas, pasižymintis puikiu sukibimu su sniegu."],
  },
  {
    id: "15877703516", cat: "autodalys", pricePln: 349, beforePln: 449, ship: "euFast", pop: 1610, tags: ["top"],
    seller: "auto-elektro", superSeller: true, brand: "70mai",
    pl: ["Kamera samochodowa 4K z GPS i Wi-Fi", "Wideorejestrator z nocnym widzeniem, czujnikiem G-sensor i obsługą przez aplikację."],
    lt: ["Automobilinis 4K vaizdo registratorius su GPS ir Wi-Fi", "Vaizdo registratorius su naktiniu matymu, G jutikliu ir valdymu per programėlę."],
  },
  {
    id: "16012284705", cat: "autodalys", pricePln: 199, beforePln: 239, ship: "euStd", pop: 880, tags: ["seasonal"],
    seller: "auto-elektro", superSeller: true, brand: "Yato", extra: [["Zasilanie", "Sieciowe"]],
    pl: ["Prostownik akumulatora 12 V/24 V z funkcją naprawy", "Inteligentny prostownik do akumulatorów kwasowych, AGM i żelowych."],
    lt: ["Akumuliatoriaus įkroviklis 12 V / 24 V su atkūrimo funkcija", "Išmanusis įkroviklis rūgštiniams, AGM ir geliniams akumuliatoriams."],
  },
  {
    id: "15344410098", cat: "autodalys", pricePln: 119, beforePln: 149, ship: "euDhl", pop: 990,
    seller: "czesci-moto", brand: "Bosch", extra: [["Rozmiar", "600/475 mm"]],
    pl: ["Pióra wycieraczek Bosch Aerotwin 600/475 mm", "Bezszkieletowe pióra zapewniające cichą i dokładną pracę."],
    lt: ["Valytuvų slotelės Bosch Aerotwin 600/475 mm", "Berėmės slotelės, užtikrinančios tylų ir kruopštų valymą."],
  },
  {
    id: "16190031277", cat: "autodalys", pricePln: 29, ship: "euFast", pop: 2050, tags: ["seasonal"],
    seller: "czesci-moto", brand: "Winterfix",
    pl: ["Skrobaczka do szyb z rękawicą", "Skrobaczka z ocieplaną rękawicą chroniącą dłoń przed zimnem."],
    lt: ["Stiklo grandiklis su pirštine", "Grandiklis su apšiltinta pirštine, saugančia ranką nuo šalčio."],
  },
  {
    id: "15799922318", cat: "autodalys", pricePln: 159, beforePln: 199, ship: "euStd", pop: 720,
    seller: "auto-elektro", superSeller: true, brand: "Xiaomi", extra: [["Zasilanie", "Akumulatorowe"]],
    pl: ["Kompresor samochodowy cyfrowy 12 V", "Kompaktowa pompka z wyświetlaczem i automatycznym zatrzymaniem po osiągnięciu ciśnienia."],
    lt: ["Skaitmeninis automobilinis kompresorius 12 V", "Kompaktiška pompa su ekranu ir automatiniu sustojimu pasiekus nustatytą slėgį."],
  },

  /* Sportas */
  {
    id: "15466720181", cat: "sportas", pricePln: 499, beforePln: 599, ship: "euDhl", pop: 430,
    seller: "fit-magazyn", brand: "IronFlex", extra: [["Waga", "2×20 kg"]],
    pl: ["Hantle regulowane 2×20 kg", "Zestaw hantli z szybką zmianą obciążenia w zakresie 2–20 kg."],
    lt: ["Reguliuojami hanteliai 2×20 kg", "Hantelių rinkinys su greitu svorio keitimu nuo 2 iki 20 kg."],
  },
  {
    id: "16044418820", cat: "sportas", pricePln: 169, beforePln: 219, ship: "euFast", pop: 690, tags: ["seasonal"],
    seller: "narty-sklep", brand: "Alpix", extra: [["Kolor", "Czarny"]],
    pl: ["Gogle narciarskie magnetyczne z dwiema szybami", "Gogle z filtrem UV400, powłoką antyparową i wymiennymi szybami."],
    lt: ["Magnetiniai slidinėjimo akiniai su dviem lęšiais", "Akiniai su UV400 filtru, nerasojančia danga ir keičiamais lęšiais."],
  },
  {
    id: "15301194463", cat: "sportas", pricePln: 89, beforePln: 119, ship: "euFast", pop: 1290, tags: ["top"],
    seller: "fit-magazyn", brand: "Zenmat", extra: [["Kolor", "Szary"]],
    pl: ["Mata do jogi TPE 6 mm", "Antypoślizgowa mata z linią pozycjonowania i paskiem do noszenia."],
    lt: ["Jogos kilimėlis TPE 6 mm", "Neslystantis kilimėlis su padėties linijomis ir nešiojimo dirželiu."],
  },
  {
    id: "15988870342", cat: "sportas", pricePln: 1299, ship: "plPallet", pop: 350,
    seller: "fit-magazyn", brand: "CycloHome",
    pl: ["Rower stacjonarny magnetyczny z aplikacją", "Cichy rower treningowy z 32 poziomami oporu."],
    lt: ["Magnetinis treniruoklis dviratis su programėle", "Tylus treniruoklis su 32 pasipriešinimo lygiais."],
  },
  {
    id: "16101137625", cat: "sportas", pricePln: 99, beforePln: 129, ship: "euStd", pop: 820, tags: ["seasonal"],
    seller: "outdoor-pl", brand: "Termico", extra: [["Pojemność", "1 l"], ["Kolor", "Czarny"]],
    pl: ["Termos stalowy 1 l z kubkiem", "Termos utrzymujący temperaturę do 24 godzin."],
    lt: ["Plieninis termosas 1 l su puodeliu", "Termosas, išlaikantis temperatūrą iki 24 valandų."],
  },
  {
    id: "15655042117", cat: "sportas", pricePln: 399, beforePln: 479, ship: "euDhl", pop: 310,
    seller: "outdoor-pl", brand: "Campio", extra: [["Kolor", "Szary"]],
    pl: ["Namiot turystyczny 3-osobowy", "Lekki namiot z dwoma przedsionkami i słupem wody 3000 mm."],
    lt: ["Turistinė palapinė trims asmenims", "Lengva palapinė su dviem prieangiais ir 3000 mm vandens atsparumu."],
  },

  /* Grožis ir sveikata */
  {
    id: "15720083391", cat: "grozis", pricePln: 299, beforePln: 399, ship: "euFast", pop: 1540, tags: ["top"],
    seller: "zdrowie-plus", superSeller: true, brand: "Philips", extra: [["Kolor", "Biały"]],
    pl: ["Szczoteczka soniczna Philips Sonicare", "Szczoteczka z trzema trybami czyszczenia, timerem i etui podróżnym."],
    lt: ["Garsinis dantų šepetėlis Philips Sonicare", "Šepetėlis su trimis valymo režimais, laikmačiu ir kelioniniu dėklu."],
  },
  {
    id: "16066607714", cat: "grozis", pricePln: 179, beforePln: 229, ship: "euStd", pop: 970,
    seller: "beauty-tech", brand: "Remington", extra: [["Moc", "2200 W"], ["Kolor", "Czarny"]],
    pl: ["Suszarka do włosów jonowa 2200 W", "Suszarka z jonizacją, trzema temperaturami i koncentratorem."],
    lt: ["Joninis plaukų džiovintuvas 2200 W", "Džiovintuvas su jonizacija, trimis temperatūros režimais ir oro srovės antgaliu."],
  },
  {
    id: "15433318806", cat: "grozis", pricePln: 49, beforePln: 65, ship: "euFast", pop: 1120, tags: ["seasonal"],
    seller: "zdrowie-plus", superSeller: true, brand: "Ziaja",
    pl: ["Krem do rąk regenerujący zestaw 3 szt.", "Odżywczy krem z mocznikiem i masłem shea na zimowe przesuszenie."],
    lt: ["Atkuriamasis rankų kremas, 3 vnt. rinkinys", "Maitinamasis kremas su karbamidu ir taukmedžio sviestu nuo žiemos sausumo."],
  },
  {
    id: "15890024419", cat: "grozis", pricePln: 229, beforePln: 289, ship: "euStd", pop: 1430, tags: ["top", "seasonal"],
    seller: "dom-cieplo", brand: "AeroMist", extra: [["Pojemność", "4 l"], ["Kolor", "Biały"]],
    pl: ["Nawilżacz powietrza ultradźwiękowy 4 l", "Cichy nawilżacz z higrostatem, trybem nocnym i dyfuzorem aromatów."],
    lt: ["Ultragarsinis oro drėkintuvas 4 l", "Tylus drėkintuvas su higrostatu, naktiniu režimu ir aromatų difuzoriumi."],
  },
  {
    id: "16211149058", cat: "grozis", pricePln: 199, ship: "plOnly", pop: 600,
    seller: "masaz-dom", brand: "Relaxo",
    pl: ["Masażer karku i pleców z podgrzewaniem", "Masażer shiatsu z ośmioma głowicami."],
    lt: ["Kaklo ir nugaros masažuoklis su šildymu", "Shiatsu masažuoklis su aštuoniomis galvutėmis."],
  },
  {
    id: "15566671230", cat: "grozis", pricePln: 119, beforePln: 159, ship: "euFast", pop: 880,
    seller: "beauty-tech", brand: "Renpho", extra: [["Kolor", "Biały"]],
    pl: ["Waga łazienkowa smart z analizą składu ciała", "Waga mierząca 13 parametrów i synchronizująca dane z aplikacją."],
    lt: ["Išmaniosios vonios svarstyklės su kūno sudėties analize", "Svarstyklės, matuojančios 13 rodiklių ir sinchronizuojančios duomenis su programėle."],
  },
];

/* ─────────────────────────── Public mock API ─────────────────────────── */

function baseParameters(seed: Seed): AllegroParameter[] {
  const rows: Array<[string, string]> = [["Stan", "Nowy"], ["Marka", seed.brand], ...(seed.extra ?? []), ["Gwarancja", "24 miesiące"]];
  return rows.map(([name, value]) => ({ name, values: [value] }));
}

function toRawOffer(seed: Seed): AllegroRawOffer {
  return {
    id: seed.id,
    name: seed.pl[0],
    description: seed.pl[1],
    category: seed.cat,
    pricePln: seed.pricePln,
    priceBeforeDiscountPln: seed.beforePln,
    images: [0, 1, 2].map((v) => `/api/placeholder/${seed.id}?v=${v}`),
    parameters: baseParameters(seed),
    stock: seed.stock ?? 25,
    seller: { login: seed.seller, superSeller: !!seed.superSeller },
    shipping: SHIPPING[seed.ship],
    popularity: seed.pop,
    tags: seed.tags ?? [],
  };
}

const RAW_OFFERS: AllegroRawOffer[] = SEEDS.map(toRawOffer);

/** Simulated network latency so loading states are realistic (but brief). */
const latency = () => new Promise((r) => setTimeout(r, 25));

export const mockAllegro = {
  async listOffers(params: { category?: CategorySlug; limit?: number } = {}): Promise<AllegroRawOffer[]> {
    await latency();
    const rows = params.category ? RAW_OFFERS.filter((o) => o.category === params.category) : RAW_OFFERS;
    return rows.slice(0, params.limit ?? rows.length);
  },
  async getOffer(id: string): Promise<AllegroRawOffer | null> {
    await latency();
    return RAW_OFFERS.find((o) => o.id === id) ?? null;
  },
};

/**
 * Exact-phrase PL → LT pairs for the mock catalogue. Consumed by the glossary
 * translator; in live mode an AI provider (DeepL / OpenAI-compatible) does
 * this job instead.
 */
export const MOCK_PHRASES: Array<[pl: string, lt: string]> = SEEDS.flatMap((s) => [
  [s.pl[0], s.lt[0]],
  [s.pl[1], s.lt[1]],
]);

/** Used by the SVG placeholder route. */
export function mockOfferMeta(id: string): { category: CategorySlug; brand: string } | null {
  const seed = SEEDS.find((s) => s.id === id);
  return seed ? { category: seed.cat, brand: seed.brand } : null;
}

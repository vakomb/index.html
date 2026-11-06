/*
 * VAIDORE – katalogo duomenų sluoksnis.
 * Pradiniai produktai, kategorijos, kolekcijų sekcijos ir pagalbinės funkcijos
 * (kainų formatavimas, tūrių pasirinkimai, INCI sąrašai, natų emoji).
 */

/* ------------------------------------------------------------------ */
/* Konstantos                                                          */
/* ------------------------------------------------------------------ */

export const FREE_SHIPPING_THRESHOLD = 40;
export const SHIPPING_COST = 3.99;
export const VAT_RATE = 0.21;
export const UPSELL_OIL = {
  id: 'upsell-oil',
  title: 'KVEPALŲ ALIEJUS 10 ML',
  price: 15.99,
};

export const STORAGE_KEYS = {
  products: 'vaidore.products.v1',
  orders: 'vaidore.orders.v1',
  cart: 'vaidore.cart.v1',
};

const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  perfumeA: unsplash('1541643600914-78b084683601'),
  perfumeB: unsplash('1523293182086-7651a899d37f'),
  perfumeC: unsplash('1592945403244-b3fbafd7f539'),
  perfumeD: unsplash('1594035910387-fea47794261f'),
  perfumeE: unsplash('1588405748880-12d1d2a59f75'),
  perfumeF: unsplash('1587017539504-67cfbddac569'),
  perfumeG: unsplash('1557170334-a9632e77c6e4'),
  perfumeH: unsplash('1595425970377-c9703cf48b6d'),
  perfumeI: unsplash('1615634260167-c8cdede054de'),
  perfumeJ: unsplash('1610461888750-10bfc601b874'),
  candleA: unsplash('1603006905003-be475563bc59'),
  candleB: unsplash('1602874801007-bd458bb1b8b6'),
  diffuser: unsplash('1608181831718-c9ffd8728a0e'),
  oilA: unsplash('1608571423902-eed4a5ad8108'),
  oilB: unsplash('1600857544200-b2f666a9a2ec'),
  giftA: unsplash('1549465220-1a8b9238cd48'),
  samples: unsplash('1563170351-be82bc888aa4'),
};

/* ------------------------------------------------------------------ */
/* Kategorijos                                                         */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  {
    id: 'namams',
    label: 'NAMAMS',
    tagline: 'Žvakės ir difuzoriai',
    image: IMAGES.candleA,
  },
  {
    id: 'rinkiniai',
    label: 'RINKINIAI',
    tagline: 'Dovanų rinkiniai',
    image: IMAGES.giftA,
  },
  {
    id: 'meginukai',
    label: 'MĖGINUKAI',
    tagline: 'Atrask savo kvapą',
    image: IMAGES.samples,
  },
  {
    id: 'kvepalai',
    label: 'KVEPALAI',
    tagline: 'Parfumuotas vanduo',
    image: IMAGES.perfumeA,
  },
  {
    id: 'aliejai',
    label: 'ALIEJAI',
    tagline: 'Koncentruoti aliejai',
    image: IMAGES.oilA,
  },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const GENDERS = ['Moterims', 'Vyrams', 'Unisex'];

/* ------------------------------------------------------------------ */
/* Kolekcijų sekcijos (ProductGrid)                                    */
/* ------------------------------------------------------------------ */

const discountRatio = (p) => (p.price > 0 ? (p.price - p.salePrice) / p.price : 0);

export const SECTIONS = [
  {
    id: 'naujienos',
    title: 'KVAPNIOS NAUJIENOS',
    subtitle: 'Šviežiausi kvapai, ką tik atkeliavę iš mūsų laboratorijos',
    select: (list) => list.filter((p) => p.isNew),
  },
  {
    id: 'moterims',
    title: 'BESTSELERIAI MOTERIMS',
    subtitle: 'Griebkite tai, ką mėgsta Moterys',
    select: (list) => list.filter((p) => p.bestseller && p.gender === 'Moterims'),
  },
  {
    id: 'vyrams',
    title: 'BESTSELERIAI VYRAMS',
    subtitle: 'Griebkite tai, ką mėgsta Vyrai',
    select: (list) => list.filter((p) => p.bestseller && p.gender === 'Vyrams'),
  },
  {
    id: 'unisex',
    title: 'UNISEX BESTSELERIAI',
    subtitle: 'Kvapai, kurie tinka kiekvienam',
    select: (list) => list.filter((p) => p.bestseller && p.gender === 'Unisex'),
  },
  {
    id: 'nuolaidos',
    title: 'DIDŽIAUSIOS NUOLAIDOS',
    subtitle: 'Geriausi pasiūlymai – kol dar liko atsargų',
    select: (list) =>
      [...list]
        .filter((p) => p.salePrice < p.price)
        .sort((a, b) => discountRatio(b) - discountRatio(a))
        .slice(0, 8),
  },
];

/* ------------------------------------------------------------------ */
/* Pradiniai produktai                                                 */
/* ------------------------------------------------------------------ */

export const SEED_PRODUCTS = [
  {
    id: 'vd-001',
    sku: 'VD-KV-001',
    title: 'DELAYED KISS',
    category: 'kvepalai',
    gender: 'Moterims',
    price: 79.99,
    salePrice: 49.99,
    inspiration: 'Paryžiaus vakaro gėlių-ambros šypras',
    notes: {
      top: ['Rožinis pipiras', 'Bergamotė', 'Kriaušė'],
      heart: ['Rožė', 'Jazminas', 'Apelsinų žiedas'],
      base: ['Vanilė', 'Baltasis muskusas', 'Pačiulis'],
    },
    image: IMAGES.perfumeB,
    isNew: true,
    bestseller: true,
    stock: 1,
  },
  {
    id: 'vd-002',
    sku: 'VD-KV-002',
    title: 'BLACK EMPIRE',
    category: 'kvepalai',
    gender: 'Vyrams',
    price: 84.99,
    salePrice: 52.99,
    inspiration: 'Tamsus orientalinis oudo ir odos akordas',
    notes: {
      top: ['Juodieji pipirai', 'Kardamonas', 'Bergamotė'],
      heart: ['Oudas', 'Tabakas', 'Smilkalai'],
      base: ['Oda', 'Ambra', 'Vetiveris'],
    },
    image: IMAGES.perfumeG,
    isNew: false,
    bestseller: true,
    stock: 1,
  },
  {
    id: 'vd-003',
    sku: 'VD-KV-003',
    title: 'MINT STRUCTURE',
    category: 'kvepalai',
    gender: 'Unisex',
    price: 74.99,
    salePrice: 46.99,
    inspiration: 'Gaivus aromatinis fougère',
    notes: {
      top: ['Bergamotė', 'Mėta', 'Eukaliptas'],
      heart: ['Levanda', 'Šalavijas', 'Geranis'],
      base: ['Vetiveris', 'Kedras', 'Samanos'],
    },
    image: IMAGES.perfumeC,
    isNew: true,
    bestseller: true,
    stock: 3,
  },
  {
    id: 'vd-004',
    sku: 'VD-KV-004',
    title: 'VELVET NOIR',
    category: 'kvepalai',
    gender: 'Moterims',
    price: 89.99,
    salePrice: 54.99,
    inspiration: 'Gurmaniškas irisų ir kakavos vakaras',
    notes: {
      top: ['Juodieji serbentai', 'Kriaušė', 'Mandarinas'],
      heart: ['Irisas', 'Pačiulis', 'Jazminas'],
      base: ['Kakava', 'Vanilė', 'Tonka pupelės'],
    },
    image: IMAGES.perfumeD,
    isNew: false,
    bestseller: true,
    stock: 1,
  },
  {
    id: 'vd-005',
    sku: 'VD-KV-005',
    title: 'AMBER TIDE',
    category: 'kvepalai',
    gender: 'Unisex',
    price: 72.99,
    salePrice: 44.99,
    inspiration: 'Mineralinis jūros ir ambros kvapas',
    notes: {
      top: ['Jūros druska', 'Greipfrutas', 'Citrina'],
      heart: ['Ambra', 'Šalavijas', 'Rozmarinas'],
      base: ['Dreifuojanti mediena', 'Muskusas', 'Kedras'],
    },
    image: IMAGES.perfumeE,
    isNew: false,
    bestseller: true,
    stock: 4,
  },
  {
    id: 'vd-006',
    sku: 'VD-KV-006',
    title: 'CEDAR ROYALE',
    category: 'kvepalai',
    gender: 'Vyrams',
    price: 79.99,
    salePrice: 49.99,
    inspiration: 'Elegantiškas citrusų ir kedro akordas',
    notes: {
      top: ['Citrina', 'Imbieras', 'Bergamotė'],
      heart: ['Kedras', 'Figų lapas', 'Levanda'],
      base: ['Santalas', 'Ambra', 'Muskusas'],
    },
    image: IMAGES.perfumeF,
    isNew: true,
    bestseller: true,
    stock: 2,
  },
  {
    id: 'vd-007',
    sku: 'VD-KV-007',
    title: 'SILK ORCHID',
    category: 'kvepalai',
    gender: 'Moterims',
    price: 76.99,
    salePrice: 47.99,
    inspiration: 'Šilkinis gėlių-vaisių kvapas',
    notes: {
      top: ['Mandarinas', 'Ličiai', 'Bergamotė'],
      heart: ['Orchidėja', 'Bijūnas', 'Rožė'],
      base: ['Baltasis muskusas', 'Kašmyro mediena', 'Vanilė'],
    },
    image: IMAGES.perfumeH,
    isNew: true,
    bestseller: false,
    stock: 1,
  },
  {
    id: 'vd-008',
    sku: 'VD-KV-008',
    title: 'NORDIC FROST',
    category: 'kvepalai',
    gender: 'Vyrams',
    price: 69.99,
    salePrice: 39.99,
    inspiration: 'Šiaurės miško gaiva',
    notes: {
      top: ['Pušies spygliai', 'Mėta', 'Greipfrutas'],
      heart: ['Arbatžolė', 'Levanda', 'Kadagys'],
      base: ['Samanos', 'Kedras', 'Vetiveris'],
    },
    image: IMAGES.perfumeI,
    isNew: false,
    bestseller: true,
    stock: 5,
  },
  {
    id: 'vd-009',
    sku: 'VD-KV-009',
    title: 'GOLDEN OUD',
    category: 'kvepalai',
    gender: 'Unisex',
    price: 99.99,
    salePrice: 59.99,
    inspiration: 'Rytietiškas šafrano ir oudo eliksyras',
    notes: {
      top: ['Šafranas', 'Rožė', 'Kardamonas'],
      heart: ['Oudas', 'Smilkalai', 'Pačiulis'],
      base: ['Ambra', 'Benzoinas', 'Santalas'],
    },
    image: IMAGES.perfumeJ,
    isNew: false,
    bestseller: true,
    stock: 1,
  },
  {
    id: 'vd-010',
    sku: 'VD-KV-010',
    title: 'CHERRY SMOKE',
    category: 'kvepalai',
    gender: 'Moterims',
    price: 82.99,
    salePrice: 44.99,
    inspiration: 'Saldus vyšnių ir tabako dūmas',
    notes: {
      top: ['Vyšnia', 'Migdolas', 'Juodieji serbentai'],
      heart: ['Tabakas', 'Rožė', 'Jazminas'],
      base: ['Tonka pupelės', 'Vanilė', 'Gvajako mediena'],
    },
    image: IMAGES.perfumeA,
    isNew: false,
    bestseller: true,
    stock: 2,
  },
  {
    id: 'vd-011',
    sku: 'VD-NM-011',
    title: 'SOFT LINEN',
    category: 'namams',
    gender: 'Unisex',
    price: 39.99,
    salePrice: 26.99,
    inspiration: 'Švarios, saulėje džiovintos patalynės kvapas',
    notes: {
      top: ['Aldehidai', 'Citrina', 'Bergamotė'],
      heart: ['Medvilnės žiedas', 'Levanda', 'Jazminas'],
      base: ['Baltasis muskusas', 'Kedras', 'Ambra'],
    },
    image: IMAGES.candleA,
    isNew: true,
    bestseller: false,
    stock: 6,
  },
  {
    id: 'vd-012',
    sku: 'VD-NM-012',
    title: 'AMBER HEARTH',
    category: 'namams',
    gender: 'Unisex',
    price: 42.99,
    salePrice: 29.99,
    inspiration: 'Jauki židinio ir gintaro šiluma',
    notes: {
      top: ['Cinamonas', 'Apelsinas', 'Gvazdikėlis'],
      heart: ['Ambra', 'Smilkalai', 'Tabakas'],
      base: ['Vanilė', 'Santalas', 'Benzoinas'],
    },
    image: IMAGES.candleB,
    isNew: false,
    bestseller: false,
    stock: 3,
  },
  {
    id: 'vd-013',
    sku: 'VD-NM-013',
    title: 'FIG GARDEN',
    category: 'namams',
    gender: 'Unisex',
    price: 49.99,
    salePrice: 34.99,
    inspiration: 'Viduržemio jūros figų sodas – difuzorius',
    notes: {
      top: ['Figų lapas', 'Bergamotė', 'Žalioji arbata'],
      heart: ['Figa', 'Kokosas', 'Jazminas'],
      base: ['Kedras', 'Muskusas', 'Samanos'],
    },
    image: IMAGES.diffuser,
    isNew: true,
    bestseller: false,
    stock: 4,
  },
  {
    id: 'vd-014',
    sku: 'VD-RN-014',
    title: 'SIGNATURE TRIO',
    category: 'rinkiniai',
    gender: 'Unisex',
    price: 129.99,
    salePrice: 89.99,
    inspiration: 'Trys populiariausi VAIDORE kvapai viename rinkinyje',
    notes: {
      top: ['Bergamotė', 'Mėta', 'Rožinis pipiras'],
      heart: ['Rožė', 'Oudas', 'Levanda'],
      base: ['Vanilė', 'Ambra', 'Kedras'],
    },
    sizes: [{ id: 'trio', label: '3 × 30 ml', sub: '3 × 1.0 fl oz', mult: 1 }],
    image: IMAGES.giftA,
    isNew: false,
    bestseller: false,
    stock: 2,
  },
  {
    id: 'vd-015',
    sku: 'VD-RN-015',
    title: 'HIS & HERS',
    category: 'rinkiniai',
    gender: 'Unisex',
    price: 149.99,
    salePrice: 99.99,
    inspiration: 'DELAYED KISS ir BLACK EMPIRE poroje',
    notes: {
      top: ['Bergamotė', 'Juodieji pipirai', 'Kriaušė'],
      heart: ['Rožė', 'Oudas', 'Jazminas'],
      base: ['Vanilė', 'Oda', 'Ambra'],
    },
    sizes: [{ id: 'duo', label: '2 × 50 ml', sub: '2 × 1.7 fl oz', mult: 1 }],
    image: IMAGES.perfumeB,
    isNew: true,
    bestseller: false,
    stock: 1,
  },
  {
    id: 'vd-016',
    sku: 'VD-MG-016',
    title: 'DISCOVERY BOX 10',
    category: 'meginukai',
    gender: 'Unisex',
    price: 29.99,
    salePrice: 19.99,
    inspiration: '10 bestselerių mėginukų rinkinys',
    notes: {
      top: ['Bergamotė', 'Mėta', 'Šafranas'],
      heart: ['Rožė', 'Irisas', 'Oudas'],
      base: ['Vanilė', 'Kedras', 'Ambra'],
    },
    sizes: [{ id: 'box10', label: '10 × 2 ml', sub: '10 × 0.07 fl oz', mult: 1 }],
    image: IMAGES.samples,
    isNew: false,
    bestseller: false,
    stock: 12,
  },
  {
    id: 'vd-017',
    sku: 'VD-MG-017',
    title: 'DISCOVERY BOX 5',
    category: 'meginukai',
    gender: 'Unisex',
    price: 17.99,
    salePrice: 11.99,
    inspiration: '5 naujienų mėginukai',
    notes: {
      top: ['Mandarinas', 'Ličiai', 'Imbieras'],
      heart: ['Orchidėja', 'Figų lapas', 'Levanda'],
      base: ['Muskusas', 'Santalas', 'Samanos'],
    },
    sizes: [{ id: 'box5', label: '5 × 2 ml', sub: '5 × 0.07 fl oz', mult: 1 }],
    image: IMAGES.perfumeE,
    isNew: true,
    bestseller: false,
    stock: 9,
  },
  {
    id: 'vd-018',
    sku: 'VD-AL-018',
    title: 'VELVET NOIR OIL',
    category: 'aliejai',
    gender: 'Moterims',
    price: 24.99,
    salePrice: 15.99,
    inspiration: 'VELVET NOIR koncentruotas kvepalų aliejus',
    notes: {
      top: ['Juodieji serbentai', 'Kriaušė', 'Mandarinas'],
      heart: ['Irisas', 'Pačiulis', 'Jazminas'],
      base: ['Kakava', 'Vanilė', 'Tonka pupelės'],
    },
    image: IMAGES.oilA,
    isNew: false,
    bestseller: false,
    stock: 7,
  },
  {
    id: 'vd-019',
    sku: 'VD-AL-019',
    title: 'BLACK EMPIRE OIL',
    category: 'aliejai',
    gender: 'Vyrams',
    price: 24.99,
    salePrice: 15.99,
    inspiration: 'BLACK EMPIRE koncentruotas kvepalų aliejus',
    notes: {
      top: ['Juodieji pipirai', 'Kardamonas', 'Bergamotė'],
      heart: ['Oudas', 'Tabakas', 'Smilkalai'],
      base: ['Oda', 'Ambra', 'Vetiveris'],
    },
    image: IMAGES.oilB,
    isNew: false,
    bestseller: false,
    stock: 1,
  },
  {
    id: 'vd-020',
    sku: 'VD-AL-020',
    title: 'MINT STRUCTURE OIL',
    category: 'aliejai',
    gender: 'Unisex',
    price: 22.99,
    salePrice: 14.99,
    inspiration: 'MINT STRUCTURE koncentruotas kvepalų aliejus',
    notes: {
      top: ['Bergamotė', 'Mėta', 'Eukaliptas'],
      heart: ['Levanda', 'Šalavijas', 'Geranis'],
      base: ['Vetiveris', 'Kedras', 'Samanos'],
    },
    image: IMAGES.oilA,
    isNew: true,
    bestseller: false,
    stock: 5,
  },
];

/* ------------------------------------------------------------------ */
/* Tūriai / dydžiai                                                    */
/* ------------------------------------------------------------------ */

const DEFAULT_SIZES = {
  kvepalai: [
    { id: '30', label: '30 ml', sub: '1.0 fl oz', mult: 0.7 },
    { id: '50', label: '50 ml', sub: '1.7 fl oz', mult: 1 },
    { id: '100', label: '100 ml', sub: '3.4 fl oz', mult: 1.55 },
  ],
  aliejai: [
    { id: '10', label: '10 ml', sub: '0.34 fl oz', mult: 1 },
    { id: '30', label: '30 ml', sub: '1.0 fl oz', mult: 2.2 },
  ],
  namams: [
    { id: '200', label: '200 g', sub: '7.0 oz', mult: 1 },
    { id: '400', label: '400 g', sub: '14.1 oz', mult: 1.7 },
  ],
  rinkiniai: [{ id: 'set', label: 'Rinkinys', sub: 'Dovanų dėžutėje', mult: 1 }],
  meginukai: [{ id: 'box', label: 'Mėginukai', sub: '2 ml buteliukai', mult: 1 }],
};

export const getSizes = (product) =>
  product.sizes && product.sizes.length ? product.sizes : DEFAULT_SIZES[product.category] || DEFAULT_SIZES.kvepalai;

export const defaultSizeId = (product) => {
  const sizes = getSizes(product);
  return (sizes.find((s) => s.mult === 1) || sizes[0]).id;
};

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Kaina pagal tūrio daugiklį, suapvalinta iki x,99. */
export const priceForSize = (base, mult) => {
  if (mult === 1) return round2(base);
  return Math.max(0.99, round2(Math.round(base * mult) - 0.01));
};

export const getPricing = (product, sizeId) => {
  const sizes = getSizes(product);
  const size = sizes.find((s) => s.id === sizeId) || sizes[0];
  return {
    size,
    price: priceForSize(product.price, size.mult),
    salePrice: priceForSize(product.salePrice, size.mult),
  };
};

/* ------------------------------------------------------------------ */
/* Formatavimas                                                        */
/* ------------------------------------------------------------------ */

/** €49,99 EUR */
export const formatPrice = (n) => `€${round2(n).toFixed(2).replace('.', ',')} EUR`;

/** 49,99€ */
export const formatEur = (n) => `${round2(n).toFixed(2).replace('.', ',')}€`;

export const discountPercent = (p) =>
  p.price > 0 && p.salePrice < p.price ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;

/** „BERGAMOTĖ · MĖTA · EUKALIPTAS“ – kortelės natų eilutė. */
export const notesLine = (p, count = 3) => {
  const all = [...(p.notes?.top || []), ...(p.notes?.heart || []), ...(p.notes?.base || [])];
  return all
    .slice(0, count)
    .map((n) => n.toUpperCase())
    .join(' · ');
};

/** Pavertimas „a, b, c“ -> ['a','b','c'] */
export const parseList = (value) =>
  String(value || '')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

/* ------------------------------------------------------------------ */
/* Natų emoji                                                          */
/* ------------------------------------------------------------------ */

const NOTE_EMOJI = [
  [/rož/i, '🌹'],
  [/jazmin|apelsinų žied|medvilnės žied|orchid|bijūn|geran/i, '🌸'],
  [/iris|levand/i, '💜'],
  [/citrin|bergamot|greipfrut|mandarin|apelsin/i, '🍋'],
  [/mėt|eukalipt|šalavij|rozmarin|figų lap|arbat|arbatžol|kadag|pušies/i, '🌿'],
  [/vyšn|serbent|kriauš|liči|fig/i, '🍒'],
  [/pipir|kardamon|imbier|cinamon|gvazdik|šafran/i, '🌶️'],
  [/vanil|tonka|kakav|migdol|benzoin|kokos/i, '🍦'],
  [/kedr|santal|vetiver|mediena|oud|gvajak/i, '🪵'],
  [/samanos/i, '🍃'],
  [/ambr|gintar/i, '🟠'],
  [/muskus|aldehid/i, '🤍'],
  [/tabak|smilkal|oda/i, '🔥'],
  [/druska|jūros/i, '🌊'],
];

const TIER_FALLBACK = { top: '🍋', heart: '🌸', base: '🪵' };

export const noteEmoji = (note, tier = 'heart') => {
  const hit = NOTE_EMOJI.find(([re]) => re.test(note));
  return hit ? hit[1] : TIER_FALLBACK[tier];
};

/* ------------------------------------------------------------------ */
/* INCI ingredientai                                                   */
/* ------------------------------------------------------------------ */

const INCI = {
  kvepalai: [
    'Alcohol Denat.',
    'Parfum (Fragrance)',
    'Aqua (Water)',
    'Limonene',
    'Linalool',
    'Coumarin',
    'Citronellol',
    'Geraniol',
    'Benzyl Salicylate',
    'Citral',
    'Eugenol',
    'Hydroxycitronellal',
    'Alpha-Isomethyl Ionone',
    'Benzyl Benzoate',
    'Farnesol',
    'BHT',
  ],
  aliejai: [
    'Caprylic/Capric Triglyceride',
    'Parfum (Fragrance)',
    'Simmondsia Chinensis (Jojoba) Seed Oil',
    'Tocopherol',
    'Limonene',
    'Linalool',
    'Coumarin',
    'Benzyl Benzoate',
    'Citronellol',
  ],
  namams: [
    'Hydrogenated Soybean Oil (Sojų vaškas)',
    'Parfum (Fragrance)',
    'Cocos Nucifera (Coconut) Oil',
    'Limonene',
    'Linalool',
    'Coumarin',
    'Medvilninis dagtis be švino',
  ],
};

export const getInci = (product) => {
  if (product.inci && product.inci.length) return product.inci;
  if (product.category === 'aliejai') return INCI.aliejai;
  if (product.category === 'namams') return INCI.namams;
  return INCI.kvepalai;
};

/* ------------------------------------------------------------------ */
/* Pradiniai užsakymai (administravimo metrikoms)                      */
/* ------------------------------------------------------------------ */

const CUSTOMERS = [
  ['Ieva Petrauskienė', 'ieva.p@example.lt'],
  ['Mantas Kazlauskas', 'mantas.k@example.lt'],
  ['Gabija Jankauskaitė', 'gabija.j@example.lt'],
  ['Lukas Stankevičius', 'lukas.s@example.lt'],
  ['Austėja Vasiliauskaitė', 'austeja.v@example.lt'],
  ['Domantas Žukauskas', 'domantas.z@example.lt'],
  ['Rugilė Butkutė', 'rugile.b@example.lt'],
  ['Tomas Paulauskas', 'tomas.p@example.lt'],
];

/** Deterministinis pseudo-atsitiktinis generatorius (mulberry32). */
const seeded = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const generateSeedOrders = (products = SEED_PRODUCTS, days = 7) => {
  const rand = seeded(20261106);
  const orders = [];
  let counter = 10420;
  const now = new Date();

  for (let d = days - 1; d >= 0; d -= 1) {
    const perDay = 3 + Math.floor(rand() * 6);
    for (let i = 0; i < perDay; i += 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      const hour = d === 0 ? Math.max(0, Math.min(now.getHours(), 8 + Math.floor(rand() * 12))) : 8 + Math.floor(rand() * 14);
      date.setHours(hour, Math.floor(rand() * 60), 0, 0);
      if (date > now) date.setTime(now.getTime() - Math.floor(rand() * 45 + 5) * 60000);

      const lineCount = 1 + Math.floor(rand() * 3);
      const items = [];
      for (let l = 0; l < lineCount; l += 1) {
        const p = products[Math.floor(rand() * products.length)];
        const qty = 1 + Math.floor(rand() * 2);
        items.push({ productId: p.id, title: p.title, size: defaultSizeId(p), qty, unitPrice: p.salePrice });
      }
      const subtotal = round2(items.reduce((s, it) => s + it.unitPrice * it.qty, 0));
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const [name, email] = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)];

      orders.push({
        createdAt: date.toISOString(),
        customer: name,
        email,
        items,
        subtotal,
        shipping,
        total: round2(subtotal + shipping),
        status: 'Apmokėta',
      });
    }
  }
  // Numeruojame chronologiškai, grąžiname naujausius pirmiausia.
  return orders
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((o) => {
      counter += 1;
      return { id: `VD-${counter}`, ...o };
    })
    .reverse();
};

/* ------------------------------------------------------------------ */
/* Saugus localStorage                                                 */
/* ------------------------------------------------------------------ */

export const storage = {
  read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* privatus režimas ar pilna saugykla – tyliai ignoruojame */
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* ignoruojama */
    }
  },
};

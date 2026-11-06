import { PHOTO, unsplash } from './images.js'

export const FREE_SHIPPING_THRESHOLD = 40
export const VAT_RATE = 0.21
export const LOW_STOCK_THRESHOLD = 5

export const PROMO_CODES = {
  VAIDORE10: { percent: 10, label: 'Sveikinimo nuolaida −10 %' },
}

export const AUDIENCES = ['Moterims', 'Vyrams', 'Unisex']

// Unisex kvapai rodomi ir skiltyse „Moterims“ bei „Vyrams“
export function matchesAudience(product, audience) {
  if (!audience || audience === 'visi') return true
  if (product.audience === audience) return true
  return audience !== 'Unisex' && product.audience === 'Unisex'
}

export const CATEGORIES = [
  {
    id: 'meginukai',
    label: 'Mėginukai',
    subtitle: 'Išbandykite prieš pirkdami · 8 × 2 ml',
    icon: 'flask',
    image: unsplash(PHOTO.perfumeTable, 900),
  },
  {
    id: 'kvepalai',
    label: 'Kvepalai',
    subtitle: 'Eau de Parfum · 22 % esencijų',
    icon: 'spray',
    image: unsplash(PHOTO.perfumeClearBlackCap, 900),
  },
  {
    id: 'rinkiniai',
    label: 'Dovanų rinkiniai',
    subtitle: 'Supakuota dovanoti',
    icon: 'gift',
    image: unsplash(PHOTO.perfumeBlackGold, 900),
  },
  {
    id: 'namu-kvapai',
    label: 'Namų kvapai',
    subtitle: 'Difuzoriai su rotango lazdelėmis',
    icon: 'wind',
    image: unsplash(PHOTO.diffuserTray, 900),
  },
  {
    id: 'aliejai',
    label: 'Aliejiniai koncentratai',
    subtitle: 'Be alkoholio · 30 % esencijų',
    icon: 'droplets',
    image: unsplash(PHOTO.oilDropperGold, 900),
  },
  {
    id: 'zvakes',
    label: 'Prabangios žvakės',
    subtitle: 'Sojų vaškas · iki 60 val. degimo',
    icon: 'flame',
    image: unsplash(PHOTO.candleDark, 900),
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

const PERFUME_COMPOSITION = [
  { label: 'Ekologiškas vynuogių alkoholis', value: 74 },
  { label: 'Kvapiųjų esencijų kompleksas', value: 22 },
  { label: 'Demineralizuotas vanduo', value: 4 },
]
const PERFUME_INCI =
  'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Benzyl Salicylate.'

// Kiekvienos kategorijos dydžiai, savybės ir sudėtis.
// factor — kainos daugiklis bazinės (numatytosios) talpos atžvilgiu;
// amount + unit — naudojama kainai už 100 ml / 100 g apskaičiuoti.
export const CATEGORY_META = {
  kvepalai: {
    sizes: [
      { id: '10', label: '10 ml', hint: 'Kelioninis', factor: 0.38, amount: 10, unit: 'ml' },
      { id: '50', label: '50 ml', hint: 'Populiariausias', factor: 1, amount: 50, unit: 'ml', isDefault: true },
      { id: '100', label: '100 ml', hint: 'Geriausia vertė', factor: 1.6, amount: 100, unit: 'ml' },
    ],
    performance: [
      { label: 'Ilgaamžiškumas', value: '12+ val.' },
      { label: 'Koncentracija', value: '22 % EDP' },
      { label: 'Sklaida', value: 'Stipri', level: 4 },
    ],
    composition: PERFUME_COMPOSITION,
    inci: PERFUME_INCI,
  },
  meginukai: {
    sizes: [{ id: '8x2', label: '8 × 2 ml', hint: '8 skirtingi kvapai', factor: 1, amount: 16, unit: 'ml', isDefault: true }],
    performance: [
      { label: 'Kvapų rinkinyje', value: '8' },
      { label: 'Koncentracija', value: '22 % EDP' },
      { label: 'Užtenka', value: '≈ 25 purškimų' },
    ],
    composition: PERFUME_COMPOSITION,
    inci: PERFUME_INCI,
  },
  rinkiniai: {
    sizes: [{ id: 'set', label: 'Rinkinys', hint: 'Dovanų dėžutėje', factor: 1, amount: null, unit: null, isDefault: true }],
    performance: [
      { label: 'Pakuotė', value: 'Dovanų dėžutė' },
      { label: 'Atvirukas', value: 'Nemokamai' },
      { label: 'Sutaupote', value: 'iki 25 %' },
    ],
    composition: PERFUME_COMPOSITION,
    inci: PERFUME_INCI,
  },
  'namu-kvapai': {
    sizes: [
      { id: '100', label: '100 ml', hint: 'Vonios kambariui', factor: 0.65, amount: 100, unit: 'ml' },
      { id: '200', label: '200 ml', hint: 'Populiariausias', factor: 1, amount: 200, unit: 'ml', isDefault: true },
      { id: '500', label: '500 ml', hint: 'Erdvioms svetainėms', factor: 1.9, amount: 500, unit: 'ml' },
    ],
    performance: [
      { label: 'Kvapo trukmė', value: 'iki 12 sav.' },
      { label: 'Koncentracija', value: '25 %' },
      { label: 'Erdvė', value: 'iki 30 m²', level: 3 },
    ],
    composition: [
      { label: 'Augalinis bazinis tirpiklis', value: 72 },
      { label: 'Kvapiųjų esencijų kompleksas', value: 25 },
      { label: 'Natūralūs fiksatoriai', value: 3 },
    ],
    inci: 'Dipropylene Glycol Methyl Ether, Parfum (Fragrance), Isopropyl Myristate, Rattan Reeds.',
  },
  zvakes: {
    sizes: [
      { id: '180', label: '180 g', hint: '≈ 40 val.', factor: 1, amount: 180, unit: 'g', isDefault: true },
      { id: '300', label: '300 g', hint: '≈ 60 val.', factor: 1.5, amount: 300, unit: 'g' },
    ],
    performance: [
      { label: 'Degimo trukmė', value: 'iki 60 val.' },
      { label: 'Vaškas', value: '100 % augalinis' },
      { label: 'Sklaida', value: 'Vidutinė', level: 3 },
    ],
    composition: [
      { label: 'Sojų ir kokosų vaškas', value: 89 },
      { label: 'Kvapiųjų esencijų kompleksas', value: 10 },
      { label: 'Medvilninė dagtis', value: 1 },
    ],
    inci: 'Hydrogenated Soybean Oil, Cocos Nucifera (Coconut) Oil, Parfum (Fragrance).',
  },
  aliejai: {
    sizes: [
      { id: '10', label: '10 ml', hint: 'Ritininis', factor: 1, amount: 10, unit: 'ml', isDefault: true },
      { id: '30', label: '30 ml', hint: 'Su lašintuvu', factor: 2.4, amount: 30, unit: 'ml' },
    ],
    performance: [
      { label: 'Ilgaamžiškumas', value: '10+ val.' },
      { label: 'Koncentracija', value: '30 %' },
      { label: 'Sklaida', value: 'Arti odos', level: 2 },
    ],
    composition: [
      { label: 'Frakcionuotas kokosų aliejus', value: 68 },
      { label: 'Grynos kvapiosios esencijos', value: 30 },
      { label: 'Vitaminas E', value: 2 },
    ],
    inci: 'Caprylic/Capric Triglyceride, Parfum (Fragrance), Tocopherol.',
  },
}

export const PYRAMID_TIERS = [
  { key: 'top', label: 'Viršutinės natos', timing: 'Pirmosios 15 minučių', share: 20 },
  { key: 'heart', label: 'Širdies natos', timing: 'Nuo 30 min. iki 4 val.', share: 35 },
  { key: 'base', label: 'Bazinės natos', timing: 'Nuo 4 val. iki vėlaus vakaro', share: 45 },
]

export const SHIPPING_METHODS = [
  {
    id: 'omniva',
    label: 'Omniva paštomatas',
    description: '1–2 darbo dienos · 300+ paštomatų Lietuvoje',
    price: 2.99,
    freeOverThreshold: true,
    eta: [1, 2],
  },
  {
    id: 'dpd',
    label: 'DPD kurjeris į namus',
    description: '1–2 darbo dienos · SMS apie pristatymo laiką',
    price: 4.49,
    freeOverThreshold: true,
    eta: [1, 2],
  },
  {
    id: 'express',
    label: 'Skubus pristatymas per 24 val.',
    description: 'Vilnius, Kaunas, Klaipėda · užsakius iki 14:00',
    price: 6.99,
    freeOverThreshold: false,
    eta: [1, 1],
  },
]

export const PARCEL_LOCKERS = [
  'Vilnius — PC „Akropolis“, Ozo g. 25',
  'Vilnius — PC „Panorama“, Saltoniškių g. 9',
  'Kaunas — PC „Mega“, Islandijos pl. 32',
  'Kaunas — PC „Akropolis“, Karaliaus Mindaugo pr. 49',
  'Klaipėda — PC „Akropolis“, Taikos pr. 61',
  'Šiauliai — PC „Saulės miestas“, Tilžės g. 109',
  'Panevėžys — PC „Babilonas“, Klaipėdos g. 143',
]

export const COUNTRIES = ['Lietuva', 'Latvija', 'Estija', 'Lenkija', 'Suomija', 'Vokietija']

export const REGIONS = [
  { country: 'Lietuva', code: 'LT', currency: 'EUR' },
  { country: 'Latvija', code: 'LV', currency: 'EUR' },
  { country: 'Estija', code: 'EE', currency: 'EUR' },
  { country: 'Lenkija', code: 'PL', currency: 'EUR' },
  { country: 'Suomija', code: 'FI', currency: 'EUR' },
  { country: 'Vokietija', code: 'DE', currency: 'EUR' },
]

export const TICKER_MESSAGES = [
  'Tik šį savaitgalį: nemokamas pristatymas užsakymams nuo 40 €',
  'Savaitgalio kainos visai kolekcijai — iki −30 %',
  'Nemokamas kvapo mėginukas prie kiekvieno užsakymo',
  'Greitas pristatymas iš ES per 1–3 darbo dienas',
  '100 % kokybės garantija arba pinigų grąžinimas',
]

// Antroji juosta po reklamine karusele
export const TRUST_TICKER = [
  { icon: 'leaf', text: 'Išpilstyta Europos Sąjungoje' },
  { icon: 'timer', text: 'Kvapas išsilaiko 12+ valandų' },
  { icon: 'flask', text: 'Testuota ES laboratorijose' },
  { icon: 'shield', text: 'Be parabenų ir ftalatų' },
  { icon: 'truck', text: 'Nemokamas pristatymas nuo 40 €' },
  { icon: 'star', text: '4,9 / 5 pagal pirkėjų įvertinimus' },
]

export const HERO_SLIDES = [
  {
    id: 'weekend',
    eyebrow: 'Savaitgalio akcija',
    title: 'Iki −30 % visai kvepalų kolekcijai',
    text: 'Pasaulinių ikonų natos, 22 % koncentracija ir 12+ valandų ilgaamžiškumas — už dalį originalo kainos.',
    cta: 'Pirkti kolekciją',
    target: { category: 'kvepalai' },
    image: unsplash(PHOTO.perfumeReflections, 1600),
    tone: 'dark',
  },
  {
    id: 'samples',
    eyebrow: 'Neapsispręsite?',
    title: 'Išbandykite 8 kvapus už 19 €',
    text: 'Mėginukų rinkinys po 2 ml — raskite savo kvapą, o rinkinio kainą atskaitysime perkant 50 ml flakoną.',
    cta: 'Rinktis mėginukus',
    target: { category: 'meginukai' },
    image: unsplash(PHOTO.perfumeTable, 1600),
    tone: 'light',
  },
  {
    id: 'home',
    eyebrow: 'Namų kvapai',
    title: 'Paverskite namus mėgstamiausiu kvapu',
    text: 'Difuzoriai ir sojų vaško žvakės, kurių kvapas jaučiamas vos įėjus pro duris.',
    cta: 'Atrasti namų kvapus',
    target: { category: 'namu-kvapai' },
    image: unsplash(PHOTO.diffuserInterior, 1600),
    tone: 'dark',
  },
]

export const TRUST_ITEMS = [
  {
    icon: 'flask',
    title: 'Neeilinė koncentracija (EDP)',
    text: '22 % kvapiųjų esencijų — beveik dvigubai daugiau nei įprastame tualetiniame vandenyje.',
  },
  {
    icon: 'refresh',
    title: 'Nemokamas keitimas',
    text: 'Kvapas netiko? Per 14 dienų pakeisime jį kitu — be klausimų ir papildomų mokesčių.',
  },
  {
    icon: 'lock',
    title: 'Saugus Stripe atsiskaitymas',
    text: '256 bitų šifravimas, Visa, Mastercard, Apple Pay ir Google Pay.',
  },
]

export const PAYMENT_METHODS = [
  'Visa',
  'Mastercard',
  'Apple Pay',
  'Google Pay',
  'El. bankininkystė',
  'Pirk dabar, mokėk vėliau',
]

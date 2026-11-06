import { PHOTO, unsplash } from './images.js'

export const FREE_SHIPPING_THRESHOLD = 40
export const VAT_RATE = 0.21
export const LOW_STOCK_THRESHOLD = 5

export const PROMO_CODES = {
  VAIDORE10: { percent: 10, label: 'Sveikinimo nuolaida −10 %' },
}

export const CATEGORIES = [
  {
    id: 'kvepalai',
    label: 'Kvepalai',
    subtitle: 'Eau de Parfum · 22 % esencijų',
    icon: 'spray',
    image: unsplash(PHOTO.perfumeClearBlackCap, 900),
  },
  {
    id: 'namu-kvapai',
    label: 'Namų kvapai',
    subtitle: 'Difuzoriai su rotango lazdelėmis',
    icon: 'wind',
    image: unsplash(PHOTO.diffuserTray, 900),
  },
  {
    id: 'zvakes',
    label: 'Prabangios žvakės',
    subtitle: 'Sojų vaškas · iki 60 val. degimo',
    icon: 'flame',
    image: unsplash(PHOTO.candleDark, 900),
  },
  {
    id: 'aliejai',
    label: 'Aliejiniai koncentratai',
    subtitle: 'Be alkoholio · 30 % esencijų',
    icon: 'droplets',
    image: unsplash(PHOTO.oilDropperGold, 900),
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))

// Kiekvienos kategorijos dydžiai, savybės ir sudėtis.
// factor — kainos daugiklis bazinės (numatytosios) talpos atžvilgiu.
export const CATEGORY_META = {
  kvepalai: {
    sizes: [
      { id: '10', label: '10 ml', hint: 'Kelioninis', factor: 0.38 },
      { id: '50', label: '50 ml', hint: 'Populiariausias', factor: 1, isDefault: true },
      { id: '100', label: '100 ml', hint: 'Geriausia vertė', factor: 1.6 },
    ],
    performance: [
      { label: 'Ilgaamžiškumas', value: '12+ val.' },
      { label: 'Koncentracija', value: '22 % EDP' },
      { label: 'Sklaida', value: 'Stipri', level: 4 },
    ],
    composition: [
      { label: 'Ekologiškas vynuogių alkoholis', value: 74 },
      { label: 'Kvapiųjų esencijų kompleksas', value: 22 },
      { label: 'Demineralizuotas vanduo', value: 4 },
    ],
    inci: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Benzyl Salicylate.',
  },
  'namu-kvapai': {
    sizes: [
      { id: '100', label: '100 ml', hint: 'Vonios kambariui', factor: 0.65 },
      { id: '200', label: '200 ml', hint: 'Populiariausias', factor: 1, isDefault: true },
      { id: '500', label: '500 ml', hint: 'Erdvioms svetainėms', factor: 1.9 },
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
      { id: '180', label: '180 g', hint: '≈ 40 val.', factor: 1, isDefault: true },
      { id: '300', label: '300 g', hint: '≈ 60 val.', factor: 1.5 },
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
      { id: '10', label: '10 ml', hint: 'Ritininis', factor: 1, isDefault: true },
      { id: '30', label: '30 ml', hint: 'Su lašintuvu', factor: 2.4 },
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

export const TICKER_MESSAGES = [
  'Tik šį savaitgalį: nemokamas pristatymas užsakymams nuo 40 €',
  'Savaitgalio kainos visai kolekcijai — iki −30 %',
  'Nemokamas kvapo mėginukas prie kiekvieno užsakymo',
  'Greitas pristatymas iš ES per 1–3 darbo dienas',
  '100 % kokybės garantija arba pinigų grąžinimas',
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

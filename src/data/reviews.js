// Demonstraciniai atsiliepimai prototipui.
// Prieš paleidžiant parduotuvę gyvai pakeiskite juos tikrais, patvirtintais
// pirkėjų atsiliepimais (ES Omnibus direktyva draudžia netikrus atsiliepimus).

export const REVIEWS = {
  'n05-libre': [
    {
      author: 'Gabija K.',
      city: 'Vilnius',
      date: '2026-10-29',
      rating: 5,
      size: '50 ml',
      text: 'Išsilaiko virš 12 valandų, kvapas identiškas originalui! Kolegės jau du kartus klausė, ką naudoju.',
    },
    {
      author: 'Rūta P.',
      city: 'Kaunas',
      date: '2026-10-17',
      rating: 5,
      size: '100 ml',
      text: 'Pirkau trečią kartą. Levanda ir vanilė skleidžiasi lygiai taip pat, o kaina — kelis kartus mažesnė.',
    },
    {
      author: 'Ieva S.',
      city: 'Klaipėda',
      date: '2026-09-30',
      rating: 4,
      size: '10 ml',
      text: 'Kelioninis buteliukas puikiai telpa į rankinę. Šleifas jaučiamas net ant šaliko kitą dieną.',
    },
  ],
  'n12-tobacco': [
    {
      author: 'Mantas V.',
      city: 'Vilnius',
      date: '2026-10-25',
      rating: 5,
      size: '50 ml',
      text: 'Tabakas ir vanilė be jokio pigaus saldumo. Tikrai prabangus kvapas, išsilaiko visą darbo dieną.',
    },
    {
      author: 'Agnė R.',
      city: 'Šiauliai',
      date: '2026-10-08',
      rating: 5,
      size: '100 ml',
      text: 'Nupirkau vyrui, bet dabar naudojame abu. Ant megztinio kvapas laikosi kelias dienas.',
    },
    {
      author: 'Lukas B.',
      city: 'Kaunas',
      date: '2026-09-21',
      rating: 5,
      size: '50 ml',
      text: 'Lyginau su originalu parduotuvėje — skirtumo neužuodžiau. Pristatė per vieną dieną.',
    },
  ],
  'n40-rouge': [
    {
      author: 'Justina M.',
      city: 'Vilnius',
      date: '2026-11-02',
      rating: 5,
      size: '50 ml',
      text: 'Tas pats šafrano ir „cukraus vatos“ švytėjimas. Nepažįstama moteris kavinėje paklausė, kokius kvepalus naudoju!',
    },
    {
      author: 'Dovilė Č.',
      city: 'Panevėžys',
      date: '2026-10-19',
      rating: 5,
      size: '100 ml',
      text: 'Sklaida stipri, užtenka dviejų purškimų. Už tokią kainą — geriausias pirkinys šiais metais.',
    },
    {
      author: 'Tomas G.',
      city: 'Klaipėda',
      date: '2026-10-03',
      rating: 4,
      size: '50 ml',
      text: 'Labai artimas originalui, pirmos minutės šiek tiek aštresnės, bet po valandos — tobula.',
    },
  ],
  'atelier-01': [
    {
      author: 'Eglė J.',
      city: 'Vilnius',
      date: '2026-10-22',
      rating: 5,
      size: '200 ml',
      text: 'Svetainė kvepia kaip SPA viešbutyje. Svečiai visada paklausia, kas taip skaniai kvepia.',
    },
    {
      author: 'Karolina D.',
      city: 'Kaunas',
      date: '2026-10-01',
      rating: 5,
      size: '500 ml',
      text: 'Naudoju jau du mėnesius, o kvapas vis dar jaučiamas įėjus į namus. Labai ekonomiška.',
    },
  ],
  'lumiere-03': [
    {
      author: 'Paulius A.',
      city: 'Vilnius',
      date: '2026-10-27',
      rating: 5,
      size: '300 g',
      text: 'Dega tolygiai, be suodžių. Rožės ir serbentų kvapas užpildo visą kambarį per kelias minutes.',
    },
    {
      author: 'Gabrielė L.',
      city: 'Alytus',
      date: '2026-10-12',
      rating: 5,
      size: '180 g',
      text: 'Gražiai supakuota — dovanojau mamai gimtadienio proga. Ji sužavėta.',
    },
  ],
}

export const GENERIC_REVIEWS = [
  {
    author: 'Simona T.',
    city: 'Vilnius',
    date: '2026-10-26',
    rating: 5,
    text: 'Kokybė pranoko lūkesčius. Pakuotė prabangi, o kvapas laikosi tikrai ilgai.',
  },
  {
    author: 'Vytautas N.',
    city: 'Kaunas',
    date: '2026-10-11',
    rating: 5,
    text: 'Užsakiau vakare, kitą dieną jau turėjau paštomate. Rekomenduoju!',
  },
  {
    author: 'Laura Ž.',
    city: 'Klaipėda',
    date: '2026-09-28',
    rating: 4,
    text: 'Labai malonus, sodrus kvapas. Kitą kartą imsiu didesnę talpą.',
  },
]

// Pagrindinio puslapio socialinio įrodymo juosta
export const HIGHLIGHT_REVIEWS = [
  { ...REVIEWS['n05-libre'][0], product: 'N° 05 — Įkvėptas Libre' },
  { ...REVIEWS['n40-rouge'][0], product: 'N° 40 — Įkvėptas Baccarat Rouge 540' },
  { ...REVIEWS['atelier-01'][0], product: 'Atelier N° 1 — Jūros druska ir šalavijas' },
  { ...REVIEWS['n12-tobacco'][0], product: 'N° 12 — Įkvėptas Tobacco Vanille' },
]

export const RATING_DISTRIBUTION = [
  { stars: 5, share: 91 },
  { stars: 4, share: 7 },
  { stars: 3, share: 1 },
  { stars: 2, share: 1 },
  { stars: 1, share: 0 },
]

export function getReviewsForProduct(product) {
  if (!product) return []
  if (REVIEWS[product.id]) return REVIEWS[product.id]
  if (!product.reviewsCount) return []
  return GENERIC_REVIEWS
}

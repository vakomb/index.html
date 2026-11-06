// Pagrindinis meniu. filter — parduotuvės filtras, route — kitas puslapis.
export const MAIN_NAV = [
  { id: 'all', label: 'Visi kvepalai', filter: { category: 'kvepalai' } },
  { id: 'women', label: 'Moterims', filter: { audience: 'Moterims' } },
  { id: 'men', label: 'Vyrams', filter: { audience: 'Vyrams' } },
  { id: 'unisex', label: 'Unisex', filter: { audience: 'Unisex' } },
  { id: 'samples', label: 'Mėginukai', filter: { category: 'meginukai' } },
  { id: 'sets', label: 'Dovanų rinkiniai', filter: { category: 'rinkiniai' } },
  { id: 'home', label: 'Namų kvapai', filter: { category: 'namu-kvapai' } },
  { id: 'oils', label: 'Aliejai', filter: { category: 'aliejai' } },
  { id: 'candles', label: 'Žvakės', filter: { category: 'zvakes' } },
  { id: 'sale', label: 'Išpardavimas', filter: { clearance: true }, accent: true },
]

export const SECONDARY_NAV = [
  { route: 'about', label: 'Apie mus' },
  { route: 'reviews', label: 'Atsiliepimai' },
  { route: 'blog', label: 'Tinklaraštis' },
  { route: 'contact', label: 'Kontaktai' },
  { route: 'partners', label: 'Partneriams' },
  { route: 'admin', label: 'Admin panelė' },
]

export const POLICY_NAV = [
  { route: 'shipping', label: 'Pristatymas' },
  { route: 'returns', label: 'Grąžinimas ir keitimas' },
  { route: 'terms', label: 'Pirkimo taisyklės' },
  { route: 'privacy', label: 'Privatumo politika' },
]

export const EMPTY_FILTER = { category: 'visi', audience: 'visi', clearance: false, query: '' }

export function filterMatchesNav(filter, item) {
  if (!filter || !item.filter) return false
  const merged = { ...EMPTY_FILTER, ...item.filter }
  return (
    merged.category === filter.category && merged.audience === filter.audience && merged.clearance === filter.clearance
  )
}

import { useCallback, useEffect, useState } from 'react'

// Maršrutizavimas per URL „#“ dalį: veikia GitHub Pages be jokių
// serverio nustatymų, palaiko naršyklės „Atgal“ mygtuką ir nuorodas.
export const ROUTES = {
  home: '',
  shop: 'parduotuve',
  about: 'apie-mus',
  admin: 'admin',
  checkout: 'apmokejimas',
  success: 'aciu',
  reviews: 'atsiliepimai',
  blog: 'tinklarastis',
  contact: 'kontaktai',
  shipping: 'pristatymas',
  returns: 'grazinimas',
  terms: 'pirkimo-taisykles',
  privacy: 'privatumas',
  partners: 'partneriams',
}

const SLUG_TO_ROUTE = Object.fromEntries(Object.entries(ROUTES).map(([route, slug]) => [slug, route]))

function readRoute() {
  const slug = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return SLUG_TO_ROUTE[slug] ?? 'home'
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((nextRoute) => {
    const slug = ROUTES[nextRoute] ?? ''
    const nextHash = `#/${slug}`
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    } else {
      setRoute(nextRoute)
    }
    window.scrollTo(0, 0)
  }, [])

  return [route, navigate]
}

import { useEffect, useRef, useState } from 'react'

// useState, kurio reikšmė išsaugoma localStorage. Jei saugykla nepasiekiama
// (privatus režimas, išjungti slapukai), būsena tiesiog gyvena atmintyje.
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch {
      // saugykla nepasiekiama — naudojama pradinė reikšmė
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  const keyRef = useRef(key)

  useEffect(() => {
    keyRef.current = key
  }, [key])

  useEffect(() => {
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value))
    } catch {
      // saugykla pilna arba nepasiekiama — tęsiame be išsaugojimo
    }
  }, [value])

  return [value, setValue]
}

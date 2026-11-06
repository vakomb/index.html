import { useEffect, useState } from 'react'

// Leidžia animuoti komponento atsiradimą ir išnykimą:
// mounted — ar elementas yra DOM, visible — ar taikoma „atidaryta“ būsena.
export function usePresence(open, duration = 380) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      let second = 0
      const first = window.requestAnimationFrame(() => {
        second = window.requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        window.cancelAnimationFrame(first)
        window.cancelAnimationFrame(second)
      }
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), duration)
    return () => window.clearTimeout(timer)
  }, [open, duration])

  return { mounted, visible }
}

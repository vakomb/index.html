import { useEffect, useRef } from 'react'

// Bendras skaitiklis, kad keli vienu metu atidaryti sluoksniai
// (pvz., prekės langas ir krepšelis) neatrakintų slinkimo per anksti.
let activeLocks = 0

function lockScroll() {
  activeLocks += 1
  if (activeLocks === 1) document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  activeLocks = Math.max(0, activeLocks - 1)
  if (activeLocks === 0) document.body.style.overflow = ''
}

// Užrakina puslapio slinkimą po modaliniu langu ir uždaro jį paspaudus Escape.
export function useOverlayBehavior(active, onClose) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!active) return undefined
    lockScroll()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active])
}

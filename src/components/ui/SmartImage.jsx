import { useState } from 'react'

function buildSrcSet(src) {
  if (!src || !src.includes('images.unsplash.com')) return undefined
  try {
    return [400, 700, 1000, 1400]
      .map((width) => {
        const url = new URL(src)
        url.searchParams.set('w', String(width))
        return `${url.toString()} ${width}w`
      })
      .join(', ')
  } catch {
    return undefined
  }
}

// Paveikslėlis su „shimmer“ skeletu ir elegantišku atsarginiu vaizdu,
// jei nuoroda neveikia — vartotojas niekada nemato sulūžusio paveikslėlio.
export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw',
  priority = false,
}) {
  const [status, setStatus] = useState(src ? 'loading' : 'error')
  const [currentSrc, setCurrentSrc] = useState(src)

  if (src !== currentSrc) {
    setCurrentSrc(src)
    setStatus(src ? 'loading' : 'error')
  }

  return (
    <div className={`relative overflow-hidden bg-smoke ${className}`}>
      {status === 'loading' && <div aria-hidden="true" className="shimmer-bg absolute inset-0 animate-shimmer" />}
      {status === 'error' ? (
        <div
          role="img"
          aria-label={alt}
          className="@container absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-smoke via-mist to-white"
        >
          <span className="text-2xl font-light text-gray-300 @[140px]:text-5xl">V</span>
          <span className="mt-2 hidden text-[10px] uppercase tracking-[0.35em] text-gray-400 @[140px]:block">Vaidore</span>
        </div>
      ) : (
        <img
          src={src}
          srcSet={buildSrcSet(src)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable="false"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  )
}

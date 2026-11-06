import React, { useState } from 'react';

/**
 * Nuotrauka su elegantišku atsarginiu vaizdu: jei išorinis paveikslėlis
 * neįsikelia, rodomas stilizuotas VAIDORE buteliukas (SVG), todėl
 * kortelės niekada neatrodo „sugedusios“.
 */
export function BottleArt({ label = 'VAIDORE', className = '', tone = 'light' }) {
  const dark = tone === 'dark';
  return (
    <svg
      viewBox="0 0 300 380"
      className={className}
      role="img"
      aria-label={`${label} buteliukas`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`glass-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={dark ? '#2b2b2b' : '#ffffff'} stopOpacity="0.95" />
          <stop offset="55%" stopColor={dark ? '#141414' : '#eef3ef'} stopOpacity="0.9" />
          <stop offset="100%" stopColor={dark ? '#000000' : '#d9e6dc'} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`liquid-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6D3A3" />
          <stop offset="100%" stopColor="#C9A961" />
        </linearGradient>
        <linearGradient id={`cap-${tone}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8f7535" />
          <stop offset="50%" stopColor="#E6D3A3" />
          <stop offset="100%" stopColor="#8f7535" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="352" rx="96" ry="10" fill="#000" opacity="0.12" />
      <rect x="118" y="40" width="64" height="58" rx="6" fill={`url(#cap-${tone})`} />
      <rect x="132" y="96" width="36" height="22" fill={dark ? '#3a3a3a' : '#cfd8d1'} />
      <rect
        x="62"
        y="116"
        width="176"
        height="232"
        rx="22"
        fill={`url(#glass-${tone})`}
        stroke={dark ? '#C9A961' : '#2E6F40'}
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <rect x="74" y="190" width="152" height="146" rx="14" fill={`url(#liquid-${tone})`} opacity="0.85" />
      <rect x="92" y="216" width="116" height="62" fill={dark ? '#000' : '#fff'} opacity="0.92" />
      <text
        x="150"
        y="244"
        textAnchor="middle"
        fontFamily="Montserrat, Inter, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="5"
        fill={dark ? '#E6D3A3' : '#000'}
      >
        VAIDORE
      </text>
      <text
        x="150"
        y="264"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="2.5"
        fill={dark ? '#C9A961' : '#2E6F40'}
      >
        EAU DE PARFUM
      </text>
      <rect x="80" y="128" width="10" height="200" rx="5" fill="#fff" opacity="0.35" />
    </svg>
  );
}

export default function ProductImage({ src, alt, className = '', imgClassName = '', sizes, loading = 'lazy' }) {
  // Būsena susieta su konkrečiu src – pakeitus nuotrauką (pvz. admin redagavimas) viskas atsistato.
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const failed = failedSrc === src;
  const loaded = loadedSrc === src;
  const setFailed = () => setFailedSrc(src);
  const setLoaded = () => setLoadedSrc(src);

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-green-light via-white to-neutral-100 p-6">
          <BottleArt label={alt} className="h-full max-h-72 w-auto" />
        </div>
      )}
      {!loaded && !failed && src && <div className="absolute inset-0 animate-pulse bg-neutral-100" aria-hidden="true" />}
    </div>
  );
}

import { useState } from 'react'
import { ArrowRight, Clock } from 'lucide-react'
import { BLOG_POSTS } from '../data/pages.js'
import { PHOTO, unsplash } from '../data/images.js'
import { formatDateLong } from '../lib/format.js'
import SmartImage from '../components/ui/SmartImage.jsx'

const COVERS = [PHOTO.perfumeReflections, PHOTO.perfumeTable, PHOTO.diffuserInterior]

export default function BlogView({ onShop }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Tinklaraštis</p>
      <h1 className="mt-2 text-[40px] font-medium leading-none tracking-[-0.02em] md:text-[60px]">Kvapų žurnalas</h1>
      <p className="mt-3 max-w-2xl text-[16px] text-gray-600">Patarimai, kaip išsirinkti, nešioti ir išsaugoti kvapą.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {BLOG_POSTS.map((post, index) => {
          const open = openId === post.id
          return (
            <article key={post.id} className={`flex flex-col ${open ? 'md:col-span-3' : ''}`}>
              <SmartImage
                src={unsplash(COVERS[index % COVERS.length], 1200)}
                alt=""
                sizes={open ? '100vw' : '(min-width: 768px) 33vw, 100vw'}
                className={`w-full rounded-xl ${open ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}
              />
              <p className="mt-4 flex items-center gap-2 text-[12px] text-gray-500">
                <time dateTime={post.date}>{formatDateLong(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" /> {post.readTime}
                </span>
              </p>
              <h2 className={`mt-1 font-extrabold leading-snug tracking-tight ${open ? 'text-[26px] md:text-[32px]' : 'text-[18px]'}`}>
                {post.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{post.excerpt}</p>
              {open && (
                <div className="mt-4 max-w-3xl space-y-3 text-[16px] leading-relaxed text-gray-800">
                  {post.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <button
                    type="button"
                    onClick={() => onShop({ category: 'meginukai' })}
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-[14px] font-bold text-white"
                  >
                    Išbandyti su mėginukų rinkiniu <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : post.id)}
                aria-expanded={open}
                className="mt-3 inline-flex w-fit items-center gap-1 text-[13px] font-bold underline underline-offset-4"
              >
                {open ? 'Suskleisti' : 'Skaityti'} {!open && <ArrowRight size={14} aria-hidden="true" />}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

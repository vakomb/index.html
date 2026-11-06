import { useState } from 'react'
import { Check, ImagePlus, X } from 'lucide-react'
import { CATEGORIES, PYRAMID_TIERS } from '../../data/catalog.js'
import { IMAGE_GALLERY } from '../../data/images.js'
import { usePresence } from '../../hooks/usePresence.js'
import { useOverlayBehavior } from '../../hooks/useOverlayBehavior.js'
import { SelectField, TextArea, TextField } from '../ui/Field.jsx'
import SmartImage from '../ui/SmartImage.jsx'
import ProductCard from '../product/ProductCard.jsx'

const EMPTY_FORM = {
  name: '',
  inspiration: '',
  price: '',
  compareAt: '',
  stock: '20',
  category: 'kvepalai',
  audience: 'Unisex',
  tagline: '',
  description: '',
  image: IMAGE_GALLERY[0].url,
  badge: 'new',
  top: '',
  heart: '',
  base: '',
}

const BADGE_OPTIONS = [
  { id: 'none', label: 'Be žymės' },
  { id: 'bestseller', label: 'Populiariausias' },
  { id: 'new', label: 'Naujiena' },
]

const AUDIENCES = ['Moterims', 'Vyrams', 'Unisex', 'Namams']

const parseNumber = (value) => Number(String(value).replace(',', '.').trim())
const parseNotes = (value) =>
  String(value)
    .split(',')
    .map((note) => note.trim())
    .filter(Boolean)

function validate(form) {
  const errors = {}
  const price = parseNumber(form.price)
  const compareAt = form.compareAt === '' ? null : parseNumber(form.compareAt)
  const stock = Number(form.stock)
  if (form.name.trim().length < 3) errors.name = 'Įveskite prekės pavadinimą'
  if (form.inspiration.trim().length < 2) errors.inspiration = 'Nurodykite atitikmenį arba įkvėpimo šaltinį'
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Kaina turi būti teigiamas skaičius'
  if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt <= price)) {
    errors.compareAt = 'Sena kaina turi būti didesnė už dabartinę'
  }
  if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Likutis — sveikasis skaičius nuo 0'
  if (form.description.trim().length < 20) errors.description = 'Aprašymas turi būti bent 20 simbolių'
  if (!/^https?:\/\/\S+$/i.test(form.image.trim())) errors.image = 'Įveskite galiojantį nuotraukos URL'
  if (parseNotes(form.top).length === 0) errors.top = 'Įveskite bent vieną viršutinę natą'
  if (parseNotes(form.heart).length === 0) errors.heart = 'Įveskite bent vieną širdies natą'
  if (parseNotes(form.base).length === 0) errors.base = 'Įveskite bent vieną bazinę natą'
  return errors
}

function buildProduct(form) {
  const name = form.name.trim()
  const description = form.description.trim()
  const firstSentence = description.match(/^[^.!?]*[.!?]/)?.[0] ?? description
  const compareAt = form.compareAt === '' ? null : parseNumber(form.compareAt)
  return {
    id: `vd-${Date.now().toString(36)}`,
    code: name.split('—')[0].trim(),
    name,
    inspiration: form.inspiration.trim(),
    category: form.category,
    audience: form.audience,
    price: Math.round(parseNumber(form.price) * 100) / 100,
    compareAt: compareAt ? Math.round(compareAt * 100) / 100 : null,
    stock: Number(form.stock),
    badge: form.badge === 'none' ? null : form.badge,
    rating: 0,
    reviewsCount: 0,
    popularity: 60,
    season: '',
    tagline: form.tagline.trim() || firstSentence,
    description,
    notes: { top: parseNotes(form.top), heart: parseNotes(form.heart), base: parseNotes(form.base) },
    image: form.image.trim(),
    createdAt: new Date().toISOString(),
  }
}

export default function ProductFormModal({ open, onClose, onSubmit }) {
  const { mounted, visible } = usePresence(open, 420)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useOverlayBehavior(open, onClose)

  if (!mounted) return null

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const bind = (field) => ({
    id: `product-${field}`,
    value: form[field],
    onChange: (event) => setField(field, event.target.value),
    error: errors[field],
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    const first = Object.keys(nextErrors)[0]
    if (first) {
      document.getElementById(`product-${first}`)?.focus()
      return
    }
    onSubmit(buildProduct(form))
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const previewErrors = validate(form)
  const preview = {
    ...buildProduct({
      ...form,
      name: form.name || 'N° 00 — Jūsų naujas kvapas',
      inspiration: form.inspiration || 'Įkvėpimo šaltinis',
      price: previewErrors.price ? '0' : form.price,
      compareAt: previewErrors.compareAt ? '' : form.compareAt,
      stock: previewErrors.stock ? '0' : form.stock,
      top: form.top || 'Viršutinės natos',
      heart: form.heart || 'Širdies natos',
      base: form.base || 'Bazinės natos',
      description: form.description || 'Aprašymas',
    }),
    id: 'preview',
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-x-0 bottom-0 top-3 flex flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl transition-all duration-500 ease-ios md:inset-6 md:rounded-[28px] xl:inset-x-[max(1.5rem,calc((100vw-76rem)/2))] ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-8 md:opacity-0'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:px-8">
          <div>
            <h2 id="product-form-title" className="text-lg font-semibold tracking-tight">
              Nauja prekė
            </h2>
            <p className="text-xs text-gray-500">Paskelbus prekė iškart atsiras parduotuvės kataloge.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti formą"
            className="flex size-10 items-center justify-center rounded-full bg-smoke transition hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-1 gap-8 px-5 py-6 md:px-8 lg:grid-cols-[1fr_300px]">
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Pavadinimas"
                    placeholder="N° 50 — Įkvėptas Lost Cherry"
                    className="sm:col-span-2"
                    {...bind('name')}
                  />
                  <TextField
                    label="Atitikmuo / Įkvėpimas"
                    placeholder="Tom Ford Lost Cherry"
                    {...bind('inspiration')}
                  />
                  <SelectField label="Kategorija" {...bind('category')}>
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </SelectField>
                  <TextField label="Kaina (€)" inputMode="decimal" placeholder="54" {...bind('price')} />
                  <TextField
                    label="Sena kaina (€)"
                    inputMode="decimal"
                    placeholder="72"
                    optional
                    hint="Rodoma perbraukta šalia akcijos kainos."
                    {...bind('compareAt')}
                  />
                  <TextField label="Likutis sandėlyje (vnt.)" inputMode="numeric" {...bind('stock')} />
                  <SelectField label="Kam skirta" {...bind('audience')}>
                    {AUDIENCES.map((audience) => (
                      <option key={audience} value={audience}>
                        {audience}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <fieldset>
                  <legend className="mb-2 text-[13px] font-medium text-gray-700">Marketinginė žymė</legend>
                  <div className="inline-flex rounded-full bg-smoke p-1">
                    {BADGE_OPTIONS.map((option) => {
                      const active = form.badge === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setField('badge', option.id)}
                          aria-pressed={active}
                          className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                            active ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                <TextField
                  label="Trumpas šūkis"
                  optional
                  placeholder="Sultingos vyšnios ir karčiųjų migdolų paslaptis."
                  {...bind('tagline')}
                />
                <TextArea
                  label="Išsamus aprašymas"
                  placeholder="Parduodantis tekstas: emocija, nuotaika, kada ir kam tinka, kiek laiko išsilaiko…"
                  rows={4}
                  {...bind('description')}
                />

                <fieldset className="rounded-2xl bg-mist p-4">
                  <legend className="sr-only">Kvapo natos</legend>
                  <p className="text-[13px] font-medium text-gray-700">Kvapo piramidė</p>
                  <p className="mt-0.5 text-xs text-gray-500">Natas atskirkite kableliais.</p>
                  <div className="mt-3 grid gap-3">
                    {PYRAMID_TIERS.map((tier) => (
                      <TextField
                        key={tier.key}
                        label={tier.label}
                        placeholder={
                          tier.key === 'top'
                            ? 'Juodosios vyšnios, Vyšnių likeris'
                            : tier.key === 'heart'
                              ? 'Turkiška rožė, Jazminas'
                              : 'Peru balzamas, Tonkos pupelės, Sandalmedis'
                        }
                        {...bind(tier.key)}
                      />
                    ))}
                  </div>
                </fieldset>

                <div>
                  <TextField
                    label="Nuotraukos URL"
                    type="url"
                    placeholder="https://images.unsplash.com/…"
                    trailing={<ImagePlus size={16} className="text-gray-400" aria-hidden="true" />}
                    {...bind('image')}
                  />
                  <p className="mt-3 text-xs text-gray-500">Arba pasirinkite iš patikrintos galerijos:</p>
                  <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                    {IMAGE_GALLERY.map((image) => {
                      const selected = form.image === image.url
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setField('image', image.url)}
                          aria-label={image.label}
                          aria-pressed={selected}
                          className={`relative shrink-0 overflow-hidden rounded-xl ring-offset-2 transition ${
                            selected ? 'ring-2 ring-black' : 'ring-0 hover:opacity-80'
                          }`}
                        >
                          <SmartImage src={image.url} alt="" sizes="64px" className="h-20 w-16" />
                          {selected && (
                            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black text-white">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <aside className="hidden lg:block" aria-label="Peržiūra">
                <div className="sticky top-0">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                    Gyva kortelės peržiūra
                  </p>
                  <div className="pointer-events-none">
                    <ProductCard product={preview} onOpen={() => {}} onAdd={() => false} />
                  </div>
                </div>
              </aside>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8 md:pb-4">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg px-5 text-sm font-medium text-gray-600 hover:text-black"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              className="h-11 rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
            >
              Paskelbti parduotuvėje
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

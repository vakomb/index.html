import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  RotateCcw,
  Search,
  AlertTriangle,
  Minus,
  Save,
} from 'lucide-react';
import {
  CATEGORIES,
  GENDERS,
  categoryLabel,
  discountPercent,
  formatEur,
  parseList,
  round2,
  IMAGES,
} from '../data/catalog';
import ProductImage from './ProductImage';

const WEEKDAYS = ['Sk', 'Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št'];

const EMPTY = {
  title: '',
  category: 'kvepalai',
  gender: 'Unisex',
  price: '',
  salePrice: '',
  inspiration: '',
  top: '',
  heart: '',
  base: '',
  image: '',
  stock: '10',
  isNew: true,
  bestseller: false,
};

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toNumber = (v) => {
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

const DEFAULT_IMAGE_BY_CATEGORY = {
  kvepalai: IMAGES.perfumeC,
  namams: IMAGES.candleA,
  aliejai: IMAGES.oilA,
  rinkiniai: IMAGES.giftA,
  meginukai: IMAGES.samples,
};

function MetricCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-2xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
          <Icon className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tabular sm:text-3xl">{value}</p>
      {sub && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
            trend === 'up' ? 'text-brand-green' : trend === 'down' ? 'text-brand-sale' : 'text-neutral-500'
          }`}
        >
          {trend === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
          {trend === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminPanel({ products, orders, onAddProduct, onUpdateProduct, onDeleteProduct, onResetData, onBackToShop }) {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  /* ---------------- Metrikos ---------------- */
  const metrics = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const todayOrders = orders.filter((o) => sameDay(new Date(o.createdAt), now));
    const yOrders = orders.filter((o) => sameDay(new Date(o.createdAt), yesterday));
    const todaySales = round2(todayOrders.reduce((s, o) => s + o.total, 0));
    const ySales = round2(yOrders.reduce((s, o) => s + o.total, 0));
    const change = ySales > 0 ? Math.round(((todaySales - ySales) / ySales) * 100) : null;
    const revenue = round2(orders.reduce((s, o) => s + o.total, 0));
    const aov = orders.length ? round2(revenue / orders.length) : 0;
    const activeSku = products.filter((p) => p.stock > 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 2).length;

    const days = [];
    for (let d = 6; d >= 0; d -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      const total = round2(orders.filter((o) => sameDay(new Date(o.createdAt), date)).reduce((s, o) => s + o.total, 0));
      days.push({ key: date.toDateString(), label: WEEKDAYS[date.getDay()], total, today: d === 0 });
    }
    const maxDay = Math.max(1, ...days.map((d) => d.total));

    return { todaySales, todayCount: todayOrders.length, change, revenue, aov, activeSku, lowStock, days, maxDay };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.title} ${p.sku} ${categoryLabel(p.category)}`.toLowerCase().includes(q));
  }, [products, query]);

  /* ---------------- Forma ---------------- */
  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  };

  const validate = () => {
    const er = {};
    const price = toNumber(form.price);
    const sale = toNumber(form.salePrice);
    const stock = toNumber(form.stock);
    if (form.title.trim().length < 2) er.title = 'Įveskite pavadinimą';
    if (!(price > 0)) er.price = 'Kaina turi būti > 0';
    if (!(sale > 0)) er.salePrice = 'Kaina turi būti > 0';
    if (price > 0 && sale > price) er.salePrice = 'Akcijos kaina negali viršyti bazinės';
    if (!Number.isInteger(stock) || stock < 0) er.stock = 'Sveikasis skaičius ≥ 0';
    if (!parseList(form.top).length) er.top = 'Bent viena nata';
    if (!parseList(form.heart).length) er.heart = 'Bent viena nata';
    if (!parseList(form.base).length) er.base = 'Bent viena nata';
    if (form.image && !/^https?:\/\//i.test(form.image.trim())) er.image = 'URL turi prasidėti http(s)://';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setErrors({});
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim().toUpperCase(),
      category: form.category,
      gender: form.gender,
      price: round2(toNumber(form.price)),
      salePrice: round2(toNumber(form.salePrice)),
      inspiration: form.inspiration.trim(),
      notes: { top: parseList(form.top), heart: parseList(form.heart), base: parseList(form.base) },
      image: form.image.trim() || DEFAULT_IMAGE_BY_CATEGORY[form.category],
      stock: toNumber(form.stock),
      isNew: !!form.isNew,
      bestseller: !!form.bestseller,
    };

    if (editingId) {
      const existing = products.find((p) => p.id === editingId);
      onUpdateProduct({ ...existing, ...payload });
      showToast(`„${payload.title}“ atnaujinta`);
    } else {
      const prefix = { kvepalai: 'KV', namams: 'NM', aliejai: 'AL', rinkiniai: 'RN', meginukai: 'MG' }[payload.category] || 'XX';
      const n = String(products.length + 1).padStart(3, '0');
      onAddProduct({ ...payload, id: `vd-${Date.now().toString(36)}`, sku: `VD-${prefix}-${n}` });
      showToast(`„${payload.title}“ pridėta – jau matoma parduotuvėje`);
    }
    resetForm();
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setErrors({});
    setForm({
      title: p.title,
      category: p.category,
      gender: p.gender,
      price: String(p.price),
      salePrice: String(p.salePrice),
      inspiration: p.inspiration || '',
      top: (p.notes?.top || []).join(', '),
      heart: (p.notes?.heart || []).join(', '),
      base: (p.notes?.base || []).join(', '),
      image: p.image || '',
      stock: String(p.stock ?? 0),
      isNew: !!p.isNew,
      bestseller: !!p.bestseller,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const adjustStock = (p, delta) => onUpdateProduct({ ...p, stock: Math.max(0, (p.stock || 0) + delta) });

  const err = (k) =>
    errors[k] ? (
      <p className="mt-1 text-[11px] font-semibold text-brand-sale" role="alert">
        {errors[k]}
      </p>
    ) : null;

  const previewDiscount = discountPercent({ price: toNumber(form.price) || 0, salePrice: toNumber(form.salePrice) || 0 });

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {/* Antraštė */}
      <div className="border-b border-brand-line bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5">
          <div>
            <button
              type="button"
              onClick={onBackToShop}
              className="mb-2 inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-black"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Į parduotuvę
            </button>
            <h1 className="heading-section">Valdymo panelė</h1>
            <p className="mt-1 text-sm text-neutral-500">Gyvi verslo rodikliai ir produktų katalogo valdymas.</p>
          </div>
          <div className="flex items-center gap-2">
            {confirmReset ? (
              <>
                <span className="text-xs font-semibold text-neutral-600">Atkurti pradinius duomenis?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setConfirmReset(false);
                    resetForm();
                    showToast('Duomenys atkurti');
                  }}
                  className="rounded-full bg-brand-sale px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-white"
                >
                  Taip
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full border border-brand-line px-3 py-1.5 text-2xs font-bold uppercase tracking-wider"
                >
                  Ne
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="btn-outline px-4 py-2 text-2xs">
                <RotateCcw className="h-3.5 w-3.5" /> Atkurti
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-page mt-6 space-y-6">
        {/* Metrikos */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Wallet}
            label="Šiandienos pardavimai"
            value={formatEur(metrics.todaySales)}
            sub={metrics.change === null ? 'Vakar pardavimų nebuvo' : `${metrics.change >= 0 ? '+' : ''}${metrics.change}% nei vakar`}
            trend={metrics.change === null ? null : metrics.change >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            icon={ShoppingCart}
            label="Viso užsakymų"
            value={orders.length}
            sub={`Šiandien: ${metrics.todayCount}`}
            trend={metrics.todayCount > 0 ? 'up' : null}
          />
          <MetricCard
            icon={Package}
            label="Aktyvūs SKU"
            value={`${metrics.activeSku}/${products.length}`}
            sub={metrics.lowStock ? `${metrics.lowStock} su mažu likučiu` : 'Atsargos tvarkingos'}
            trend={metrics.lowStock ? 'down' : null}
          />
          <MetricCard icon={TrendingUp} label="Vid. krepšelis" value={formatEur(metrics.aov)} sub={`Pajamos: ${formatEur(metrics.revenue)}`} />
        </div>

        {/* 7 dienų grafikas */}
        <div className="rounded-2xl border border-brand-line bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-2xs font-bold uppercase tracking-[0.16em] text-neutral-500">Pardavimai per 7 dienas</p>
            <p className="text-xs font-semibold tabular text-neutral-500">
              {formatEur(metrics.days.reduce((s, d) => s + d.total, 0))}
            </p>
          </div>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-4" role="img" aria-label="Pardavimų per 7 dienas stulpelinė diagrama">
            {metrics.days.map((d) => (
              <div key={d.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-semibold tabular text-neutral-500 opacity-0 transition group-hover:opacity-100">
                  {Math.round(d.total)}€
                </span>
                <div
                  className={`w-full max-w-[56px] rounded-t-lg transition-all duration-500 ${d.today ? 'bg-brand-green' : 'bg-neutral-200 group-hover:bg-neutral-300'}`}
                  style={{ height: `${Math.max(4, (d.total / metrics.maxDay) * 100)}%` }}
                />
                <span className={`text-[11px] font-bold uppercase ${d.today ? 'text-brand-green' : 'text-neutral-500'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* CRUD forma */}
          <form onSubmit={submit} className="h-fit rounded-2xl border border-brand-line bg-white p-4 sm:p-5 lg:sticky lg:top-24" noValidate>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-extrabold uppercase tracking-[0.1em]">
                {editingId ? 'Redaguoti prekę' : 'Nauja prekė'}
              </h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-2xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black">
                  Atšaukti
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="col-span-2">
                <span className="input-label">Pavadinimas</span>
                <input className="input-field uppercase" value={form.title} onChange={set('title')} placeholder="pvz. MIDNIGHT AMBER" />
                {err('title')}
              </label>

              <label>
                <span className="input-label">Kategorija</span>
                <select className="input-field" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="input-label">Kam skirta</span>
                <select className="input-field" value={form.gender} onChange={set('gender')}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="input-label">Bazinė kaina (€)</span>
                <input inputMode="decimal" className="input-field tabular" value={form.price} onChange={set('price')} placeholder="79,99" />
                {err('price')}
              </label>
              <label>
                <span className="input-label">
                  Akcijos kaina (€)
                  {previewDiscount > 0 && <span className="ml-1 text-brand-sale">-{previewDiscount}%</span>}
                </span>
                <input
                  inputMode="decimal"
                  className="input-field tabular text-brand-sale"
                  value={form.salePrice}
                  onChange={set('salePrice')}
                  placeholder="49,99"
                />
                {err('salePrice')}
              </label>

              <label className="col-span-2">
                <span className="input-label">Įkvėpimo šaltinis</span>
                <input className="input-field" value={form.inspiration} onChange={set('inspiration')} placeholder="pvz. Šiltas vakaro gintaras" />
              </label>

              <label className="col-span-2">
                <span className="input-label">🍋 Viršutinės natos</span>
                <input className="input-field" value={form.top} onChange={set('top')} placeholder="Bergamotė, Mėta, Citrina" />
                {err('top')}
              </label>
              <label className="col-span-2">
                <span className="input-label">🌸 Širdies natos</span>
                <input className="input-field" value={form.heart} onChange={set('heart')} placeholder="Rožė, Jazminas, Levanda" />
                {err('heart')}
              </label>
              <label className="col-span-2">
                <span className="input-label">🪵 Bazinės natos</span>
                <input className="input-field" value={form.base} onChange={set('base')} placeholder="Vanilė, Kedras, Muskusas" />
                {err('base')}
              </label>

              <label className="col-span-2">
                <span className="input-label">Nuotraukos URL (nebūtina)</span>
                <input className="input-field" value={form.image} onChange={set('image')} placeholder="https://images.unsplash.com/…" />
                {err('image')}
              </label>

              <label>
                <span className="input-label">Likutis (vnt.)</span>
                <input inputMode="numeric" className="input-field tabular" value={form.stock} onChange={set('stock')} />
                {err('stock')}
              </label>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.isNew} onChange={set('isNew')} className="h-4 w-4 accent-brand-green" /> Naujiena
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.bestseller} onChange={set('bestseller')} className="h-4 w-4 accent-brand-green" />{' '}
                  Bestseleris
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-5 w-full">
              {editingId ? (
                <>
                  <Save className="h-4 w-4" /> Išsaugoti pakeitimus
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Pridėti prekę
                </>
              )}
            </button>
          </form>

          <div className="min-w-0 space-y-6">
            {/* Produktų sąrašas */}
            <div className="rounded-2xl border border-brand-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line p-4 sm:p-5">
                <h2 className="font-display text-base font-extrabold uppercase tracking-[0.1em]">
                  Katalogas <span className="text-neutral-400">({products.length})</span>
                </h2>
                <label className="relative w-full sm:w-64">
                  <span className="sr-only">Ieškoti prekių</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input className="input-field py-2 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ieškoti pagal pavadinimą, SKU…" />
                </label>
              </div>

              <ul className="max-h-[640px] divide-y divide-brand-line overflow-y-auto">
                {filteredProducts.map((p) => (
                  <li key={p.id} className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${editingId === p.id ? 'bg-brand-green-light' : ''}`}>
                    <ProductImage src={p.image} alt={p.title} className="h-14 w-12 shrink-0 rounded-md border border-brand-line" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-extrabold uppercase">{p.title}</p>
                      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        {p.sku} · {categoryLabel(p.category)} · {p.gender}
                      </p>
                      <p className="text-xs tabular">
                        <s className="text-neutral-400">{formatEur(p.price)}</s>{' '}
                        <span className="font-bold text-brand-sale">{formatEur(p.salePrice)}</span>
                      </p>
                    </div>

                    <div className="hidden items-center rounded-full border border-brand-line sm:flex" aria-label={`Likutis: ${p.stock}`}>
                      <button
                        type="button"
                        onClick={() => adjustStock(p, -1)}
                        className="flex h-8 w-7 items-center justify-center rounded-l-full hover:bg-neutral-100"
                        aria-label="Mažinti likutį"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span
                        className={`w-8 text-center text-xs font-bold tabular ${
                          p.stock === 0 ? 'text-brand-sale' : p.stock <= 2 ? 'text-amber-600' : ''
                        }`}
                      >
                        {p.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustStock(p, 1)}
                        className="flex h-8 w-7 items-center justify-center rounded-r-full hover:bg-neutral-100"
                        aria-label="Didinti likutį"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {confirmDelete === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProduct(p.id);
                            setConfirmDelete(null);
                            if (editingId === p.id) resetForm();
                            showToast(`„${p.title}“ pašalinta`);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-sale text-white"
                          aria-label="Patvirtinti šalinimą"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-line"
                          aria-label="Atšaukti šalinimą"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
                          aria-label={`Redaguoti ${p.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-red-50 hover:text-brand-sale"
                          aria-label={`Šalinti ${p.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {filteredProducts.length === 0 && <li className="px-5 py-10 text-center text-sm text-neutral-500">Prekių nerasta.</li>}
              </ul>
            </div>

            {/* Naujausi užsakymai */}
            <div className="rounded-2xl border border-brand-line bg-white">
              <div className="border-b border-brand-line p-4 sm:p-5">
                <h2 className="font-display text-base font-extrabold uppercase tracking-[0.1em]">Naujausi užsakymai</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="text-2xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      <th className="px-5 py-3">Nr.</th>
                      <th className="px-5 py-3">Klientas</th>
                      <th className="px-5 py-3">Data</th>
                      <th className="px-5 py-3">Prekės</th>
                      <th className="px-5 py-3 text-right">Suma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line">
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.id}>
                        <td className="whitespace-nowrap px-5 py-3 font-bold tabular">{o.id}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold">{o.customer}</p>
                          <p className="text-xs text-neutral-500">{o.email}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-neutral-600 tabular">
                          {new Date(o.createdAt).toLocaleString('lt-LT', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-3 text-neutral-600">{o.items.reduce((s, it) => s + it.qty, 0)} vnt.</td>
                        <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold tabular">{formatEur(o.total)}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-neutral-500">
                          Užsakymų dar nėra.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {metrics.lowStock > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  <strong>{metrics.lowStock}</strong> prekės turi 2 ar mažiau vienetų likutį. Papildykite atsargas, kad neprarastumėte pardavimų.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="status">
          <div className="flex animate-pop-in items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-card">
            <Check className="h-4 w-4 text-brand-gold" strokeWidth={3} /> {toast}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Instagram, Facebook, Mail, ShieldCheck, Truck, RotateCcw, Leaf } from 'lucide-react';

import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  SEED_PRODUCTS,
  STORAGE_KEYS,
  UPSELL_OIL,
  VAT_RATE,
  defaultSizeId,
  generateSeedOrders,
  getPricing,
  round2,
  storage,
} from './data/catalog';

/* ------------------------------------------------------------------ */
/* Maršrutizavimas (hash router be papildomų priklausomybių)            */
/* ------------------------------------------------------------------ */

const ROUTES = { '#/admin': 'admin' };
const viewFromHash = () => ROUTES[window.location.hash] || 'shop';
const hashForView = (view) => (view === 'admin' ? '#/admin' : '#/');

const scrollToShop = () => {
  window.requestAnimationFrame(() => {
    const el = document.getElementById('parduotuve');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

/* ------------------------------------------------------------------ */
/* Poraštė                                                             */
/* ------------------------------------------------------------------ */

function Footer({ onNavigate }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brand-line bg-white">
      <div className="border-b border-brand-line">
        <ul className="container-page grid grid-cols-2 gap-4 py-8 text-center lg:grid-cols-4">
          {[
            { icon: Truck, title: 'Nemokamas pristatymas', text: 'Užsakymams nuo 40€' },
            { icon: RotateCcw, title: '14 dienų grąžinimas', text: 'Be papildomų klausimų' },
            { icon: ShieldCheck, title: 'Saugus apmokėjimas', text: 'VISA · Mastercard · AMEX' },
            { icon: Leaf, title: 'Pagaminta Lietuvoje', text: 'Netestuota su gyvūnais' },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col items-center">
              <Icon className="h-6 w-6 text-brand-green" strokeWidth={2} />
              <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em]">{title}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-extrabold uppercase tracking-brand">VAIDORE</p>
          <p className="mt-3 max-w-xs text-sm text-neutral-500">
            Premium lietuviški kvepalai, kurti su meile detalėms. 1 000 000+ pagamintų buteliukų ir 4,9 ★ iš 20000+ įvertinimų.
          </p>
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-neutral-400">Parduotuvė</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li>
              <button type="button" onClick={() => onNavigate('shop', 'kvepalai')} className="hover:text-brand-green">
                Kvepalai
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('shop', 'namams')} className="hover:text-brand-green">
                Namams
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('shop', 'rinkiniai')} className="hover:text-brand-green">
                Rinkiniai
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('shop', 'meginukai')} className="hover:text-brand-green">
                Mėginukai
              </button>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-neutral-400">Pagalba</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>Pristatymas 1–3 darbo dienos</li>
            <li>Grąžinimas per 14 dienų</li>
            <li>
              <a href="mailto:info@vaidore.com" className="font-semibold text-black hover:text-brand-green">
                info@vaidore.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.18em] text-neutral-400">Sekite mus</p>
          <div className="mt-3 flex gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="icon-btn border border-brand-line"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="icon-btn border border-brand-line"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a href="mailto:info@vaidore.com" className="icon-btn border border-brand-line" aria-label="El. paštas">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-black py-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
        © {year} VAIDORE · Vaidore.com · Visos teisės saugomos
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Programa                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState(viewFromHash);
  const [products, setProducts] = useState(() => storage.read(STORAGE_KEYS.products, SEED_PRODUCTS));
  const [orders, setOrders] = useState(() => storage.read(STORAGE_KEYS.orders, null) || generateSeedOrders());
  const [cart, setCart] = useState(() => storage.read(STORAGE_KEYS.cart, { lines: [], upsell: false }));
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ---------- Persistencija ---------- */
  useEffect(() => storage.write(STORAGE_KEYS.products, products), [products]);
  useEffect(() => storage.write(STORAGE_KEYS.orders, orders), [orders]);
  useEffect(() => storage.write(STORAGE_KEYS.cart, cart), [cart]);

  /* ---------- Maršrutas ---------- */
  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((target, category) => {
    const hash = hashForView(target);
    if (window.location.hash !== hash) window.location.hash = hash;
    setView(target);
    if (target === 'shop' && category !== undefined) {
      setActiveCategory(category);
      setSearchQuery('');
      scrollToShop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /* ---------- Slinkties užrakinimas ---------- */
  const overlayOpen = cartOpen || Boolean(activeProductId);
  useEffect(() => {
    if (!overlayOpen) return undefined;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [overlayOpen]);

  /* ---------- Krepšelis ---------- */
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartItems = useMemo(
    () =>
      cart.lines
        .map((line) => {
          const product = productMap.get(line.productId);
          if (!product) return null;
          const { size, price, salePrice } = getPricing(product, line.sizeId);
          return {
            key: line.key,
            product,
            sizeId: size.id,
            sizeLabel: size.label,
            qty: line.qty,
            unitPrice: salePrice,
            regularPrice: price,
            maxQty: Math.max(1, Math.min(product.stock || 1, 10)),
          };
        })
        .filter(Boolean),
    [cart.lines, productMap]
  );

  const cartCount = cartItems.reduce((s, it) => s + it.qty, 0) + (cart.upsell && cartItems.length ? 1 : 0);

  const totals = useMemo(() => {
    const subtotal = round2(cartItems.reduce((s, it) => s + it.regularPrice * it.qty, 0));
    const itemsTotal = round2(cartItems.reduce((s, it) => s + it.unitPrice * it.qty, 0));
    const savings = round2(subtotal - itemsTotal);
    const upsellCost = cart.upsell && cartItems.length ? UPSELL_OIL.price : 0;
    const merchandise = round2(itemsTotal + upsellCost);
    const shipping = merchandise === 0 || merchandise >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = round2(merchandise + shipping);
    const vat = round2(total - total / (1 + VAT_RATE));
    return {
      subtotal,
      savings,
      merchandise,
      shipping,
      total,
      vat,
      freeShippingRemaining: round2(Math.max(0, FREE_SHIPPING_THRESHOLD - merchandise)),
    };
  }, [cartItems, cart.upsell]);

  const addToCart = useCallback(
    (product, sizeId, qty = 1) => {
      if ((product.stock ?? 0) <= 0) return;
      const size = sizeId || defaultSizeId(product);
      const key = `${product.id}__${size}`;
      const cap = Math.max(1, Math.min(product.stock || 1, 10));
      setCart((c) => {
        const existing = c.lines.find((l) => l.key === key);
        const lines = existing
          ? c.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(cap, l.qty + qty) } : l))
          : [...c.lines, { key, productId: product.id, sizeId: size, qty: Math.min(cap, qty) }];
        return { ...c, lines };
      });
      setActiveProductId(null);
      setCartOpen(true);
    },
    []
  );

  const quickAdd = useCallback((product) => addToCart(product, defaultSizeId(product), 1), [addToCart]);

  const updateQty = useCallback(
    (key, qty) =>
      setCart((c) => ({
        ...c,
        lines: qty <= 0 ? c.lines.filter((l) => l.key !== key) : c.lines.map((l) => (l.key === key ? { ...l, qty } : l)),
      })),
    []
  );

  const removeLine = useCallback((key) => setCart((c) => ({ ...c, lines: c.lines.filter((l) => l.key !== key) })), []);

  const toggleUpsell = useCallback(() => setCart((c) => ({ ...c, upsell: !c.upsell })), []);

  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeProduct = useCallback(() => setActiveProductId(null), []);

  const placeOrder = useCallback(
    (customer) => {
      const lastNumber = orders.reduce((max, o) => Math.max(max, Number(String(o.id).replace(/\D/g, '')) || 0), 10420);
      const items = cartItems.map((it) => ({
        productId: it.product.id,
        title: it.product.title,
        size: it.sizeId,
        qty: it.qty,
        unitPrice: it.unitPrice,
      }));
      if (cart.upsell && cartItems.length) {
        items.push({ productId: UPSELL_OIL.id, title: UPSELL_OIL.title, size: '10', qty: 1, unitPrice: UPSELL_OIL.price });
      }
      const order = {
        id: `VD-${lastNumber + 1}`,
        createdAt: new Date().toISOString(),
        ...customer,
        items,
        subtotal: totals.merchandise,
        shipping: totals.shipping,
        total: totals.total,
        status: 'Apmokėta',
      };

      setOrders((o) => [order, ...o]);
      // Sumažiname likučius
      const sold = cartItems.reduce((acc, it) => acc.set(it.product.id, (acc.get(it.product.id) || 0) + it.qty), new Map());
      setProducts((list) => list.map((p) => (sold.has(p.id) ? { ...p, stock: Math.max(0, (p.stock || 0) - sold.get(p.id)) } : p)));
      setCart({ lines: [], upsell: false });
      return order;
    },
    [orders, cartItems, cart.upsell, totals]
  );

  /* ---------- Katalogo CRUD ---------- */
  const addProduct = useCallback((product) => setProducts((list) => [product, ...list]), []);
  const updateProduct = useCallback((product) => setProducts((list) => list.map((p) => (p.id === product.id ? product : p))), []);
  const deleteProduct = useCallback((id) => {
    setProducts((list) => list.filter((p) => p.id !== id));
    setCart((c) => ({ ...c, lines: c.lines.filter((l) => l.productId !== id) }));
  }, []);
  const resetData = useCallback(() => {
    storage.remove(STORAGE_KEYS.products);
    storage.remove(STORAGE_KEYS.orders);
    setProducts(SEED_PRODUCTS);
    setOrders(generateSeedOrders());
  }, []);

  /* ---------- Filtrai ---------- */
  const selectCategory = useCallback(
    (id) => {
      setActiveCategory(id);
      setSearchQuery('');
      if (view !== 'shop') navigate('shop');
      scrollToShop();
    },
    [view, navigate]
  );

  const clearFilters = useCallback(() => {
    setActiveCategory(null);
    setSearchQuery('');
  }, []);

  const categoryCounts = useMemo(
    () => products.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {}),
    [products]
  );

  const activeProduct = activeProductId ? productMap.get(activeProductId) : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBar />
      <Header
        view={view}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onNavigate={navigate}
        activeCategory={activeCategory}
        onSelectCategory={selectCategory}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) setActiveCategory(null);
        }}
      />

      <main className="flex-1">
        {view === 'admin' ? (
          <AdminPanel
            products={products}
            orders={orders}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onResetData={resetData}
            onBackToShop={() => navigate('shop')}
          />
        ) : (
          <>
            <Hero onShopNow={scrollToShop} />
            <Categories activeCategory={activeCategory} onSelect={selectCategory} counts={categoryCounts} />
            <ProductGrid
              products={products}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onOpenProduct={(p) => setActiveProductId(p.id)}
              onQuickAdd={quickAdd}
              onClearFilters={clearFilters}
            />
          </>
        )}
      </main>

      {view === 'shop' && <Footer onNavigate={navigate} />}

      {activeProduct && (
        <ProductDetailModal key={activeProduct.id} product={activeProduct} onClose={closeProduct} onAddToCart={addToCart} />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        items={cartItems}
        totals={totals}
        upsell={cart.upsell}
        onToggleUpsell={toggleUpsell}
        onUpdateQty={updateQty}
        onRemove={removeLine}
        onPlaceOrder={placeOrder}
      />
    </div>
  );
}

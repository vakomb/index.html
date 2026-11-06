import React, { useEffect, useRef, useState } from 'react';
import { Menu, Search, User, ShoppingBag, X, ChevronRight, LayoutDashboard, Store } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';

export default function Header({
  view,
  cartCount,
  onOpenCart,
  onNavigate,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goCategory = (id) => {
    setMenuOpen(false);
    onSelectCategory(id);
  };

  const goView = (target) => {
    setMenuOpen(false);
    onNavigate(target);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (view !== 'shop') onNavigate('shop');
    window.requestAnimationFrame(() => {
      const el = document.getElementById('parduotuve');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const navItems = [{ id: null, label: 'VISKAS' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-brand-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 transition-shadow ${
          scrolled ? 'shadow-[0_6px_20px_-12px_rgba(0,0,0,0.25)]' : ''
        }`}
      >
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center sm:h-[72px]">
          {/* Kairė */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="icon-btn -ml-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Atidaryti meniu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Pagrindinė navigacija">
              <button
                type="button"
                onClick={() => goView('shop')}
                className={`text-xs font-bold uppercase tracking-[0.16em] transition hover:text-brand-green ${
                  view === 'shop' ? 'text-black' : 'text-neutral-500'
                }`}
              >
                Parduotuvė
              </button>
              <button
                type="button"
                onClick={() => {
                  goView('shop');
                  window.requestAnimationFrame(() => {
                    const el = document.getElementById('distributoriai');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  });
                }}
                className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-brand-green"
              >
                Distributoriams
              </button>
            </nav>
          </div>

          {/* Centras – prekės ženklas */}
          <button
            type="button"
            onClick={() => goView('shop')}
            className="justify-self-center px-2 font-display text-lg font-extrabold uppercase tracking-brand text-black sm:text-2xl"
            aria-label="VAIDORE – pagrindinis puslapis"
          >
            <span className="mr-[-0.42em]">VAIDORE</span>
          </button>

          {/* Dešinė */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Paieška"
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Search className="h-5 w-5" strokeWidth={2.2} />}
            </button>
            <button
              type="button"
              className={`icon-btn ${view === 'admin' ? 'bg-neutral-100' : ''}`}
              onClick={() => goView(view === 'admin' ? 'shop' : 'admin')}
              aria-label={view === 'admin' ? 'Grįžti į parduotuvę' : 'Paskyra ir valdymo panelė'}
              title={view === 'admin' ? 'Grįžti į parduotuvę' : 'Valdymo panelė'}
            >
              <User className="h-5 w-5" strokeWidth={2.2} />
            </button>
            <button type="button" className="icon-btn -mr-2" onClick={onOpenCart} aria-label={`Krepšelis, prekių: ${cartCount}`}>
              <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] animate-pop-in items-center justify-center rounded-full bg-brand-green px-1 text-[10px] font-bold leading-none text-white tabular"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Kategorijų juosta (desktop) */}
        {view === 'shop' && (
          <div className="hidden border-t border-brand-line lg:block">
            <nav className="container-page flex h-11 items-center justify-center gap-8" aria-label="Kategorijos">
              {navItems.map((item) => {
                const active = activeCategory === item.id;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goCategory(item.id)}
                    className={`relative h-full text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                      active ? 'text-brand-green' : 'text-neutral-700 hover:text-black'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-0 bottom-0 h-0.5 bg-brand-green transition-transform ${
                        active ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Paieška */}
        {searchOpen && (
          <div className="animate-fade-in border-t border-brand-line bg-white">
            <form onSubmit={submitSearch} className="container-page flex items-center gap-3 py-3" role="search">
              <Search className="h-5 w-5 shrink-0 text-neutral-400" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ieškoti kvapo, natos ar kategorijos…"
                className="h-10 w-full bg-transparent font-medium placeholder:text-neutral-400 focus:outline-none"
                aria-label="Paieškos laukas"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="shrink-0 text-2xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black"
                >
                  Išvalyti
                </button>
              )}
            </form>
          </div>
        )}
      </header>

      {/* Mobilus meniu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Meniu">
          <button
            type="button"
            className="absolute inset-0 h-full w-full animate-fade-in bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-label="Uždaryti meniu"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in-left flex-col bg-white">
            <div className="flex h-16 items-center justify-between border-b border-brand-line px-4">
              <span className="font-display text-lg font-extrabold uppercase tracking-brand">VAIDORE</span>
              <button type="button" className="icon-btn -mr-2" onClick={() => setMenuOpen(false)} aria-label="Uždaryti">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <p className="px-5 pb-2 pt-5 text-2xs font-bold uppercase tracking-[0.2em] text-neutral-400">Kategorijos</p>
              <ul>
                {navItems.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => goCategory(item.id)}
                      className={`flex w-full items-center justify-between border-b border-brand-line px-5 py-4 text-left text-sm font-extrabold uppercase tracking-[0.12em] ${
                        activeCategory === item.id && view === 'shop' ? 'text-brand-green' : 'text-black'
                      }`}
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="px-5 pb-2 pt-6 text-2xs font-bold uppercase tracking-[0.2em] text-neutral-400">Daugiau</p>
              <div className="space-y-1 px-3">
                <button
                  type="button"
                  onClick={() => goView('shop')}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-semibold hover:bg-neutral-50"
                >
                  <Store className="h-5 w-5" /> Parduotuvė
                </button>
                <button
                  type="button"
                  onClick={() => goView('admin')}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm font-semibold hover:bg-neutral-50"
                >
                  <LayoutDashboard className="h-5 w-5" /> Valdymo panelė
                </button>
              </div>
            </div>

            <div className="safe-bottom border-t border-brand-line bg-brand-green px-5 pt-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">🚚 Nemokamas pristatymas nuo 40€</p>
              <p className="mt-1 text-xs text-white/80">⭐ 4,9 iš 20000+ įvertinimų</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

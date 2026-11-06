import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SEED_PRODUCTS } from './data/products.js'
import { REGIONS } from './data/catalog.js'
import { EMPTY_FILTER } from './data/navigation.js'
import { INFO_PAGES } from './data/pages.js'
import { useHashRoute } from './hooks/useHashRoute.js'
import { usePersistentState } from './hooks/usePersistentState.js'
import { generateOrderId } from './lib/format.js'
import { buildCartLines, cartCount, computeTotals, getSize, quantityInCart } from './lib/pricing.js'
import AnnouncementBar from './components/layout/AnnouncementBar.jsx'
import Header from './components/layout/Header.jsx'
import TabBar from './components/layout/TabBar.jsx'
import Footer from './components/layout/Footer.jsx'
import MobileMenu from './components/layout/MobileMenu.jsx'
import SearchOverlay from './components/layout/SearchOverlay.jsx'
import AccountDrawer from './components/layout/AccountDrawer.jsx'
import CartDrawer from './components/cart/CartDrawer.jsx'
import ProductDetail from './components/product/ProductDetail.jsx'
import Toast from './components/ui/Toast.jsx'
import HomeView from './views/HomeView.jsx'
import ShopView from './views/ShopView.jsx'
import CheckoutView from './views/CheckoutView.jsx'
import SuccessView from './views/SuccessView.jsx'
import AboutView from './views/AboutView.jsx'
import AdminView from './views/AdminView.jsx'
import InfoView from './views/InfoView.jsx'
import BlogView from './views/BlogView.jsx'
import ReviewsView from './views/ReviewsView.jsx'

// Raktų versija leidžia ateityje pakeisti duomenų struktūrą nesugadinant
// lankytojų naršyklėse jau išsaugotos būsenos.
const STORAGE_KEYS = {
  products: 'vaidore:v2:products',
  cart: 'vaidore:v2:cart',
  orders: 'vaidore:v2:orders',
  account: 'vaidore:v2:account',
  region: 'vaidore:v2:region',
  newsletter: 'vaidore:v2:newsletter',
}

const PAGE_TITLES = {
  home: 'Vaidore — Prabangūs kvapai | Vaidore.com',
  shop: 'Parduotuvė — Vaidore',
  about: 'Apie mus — Vaidore',
  admin: 'Admin panelė — Vaidore',
  checkout: 'Atsiskaitymas — Vaidore',
  success: 'Užsakymas gautas — Vaidore',
  reviews: 'Atsiliepimai — Vaidore',
  blog: 'Tinklaraštis — Vaidore',
  contact: 'Kontaktai — Vaidore',
  shipping: 'Pristatymas — Vaidore',
  returns: 'Grąžinimas ir keitimas — Vaidore',
  terms: 'Pirkimo taisyklės — Vaidore',
  privacy: 'Privatumo politika — Vaidore',
  partners: 'Partneriams — Vaidore',
}

export default function App() {
  const [route, navigate] = useHashRoute()
  const [products, setProducts] = usePersistentState(STORAGE_KEYS.products, SEED_PRODUCTS)
  const [cart, setCart] = usePersistentState(STORAGE_KEYS.cart, [])
  const [orders, setOrders] = usePersistentState(STORAGE_KEYS.orders, [])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState(null)
  const [shopFilter, setShopFilter] = useState(EMPTY_FILTER)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [account, setAccount] = usePersistentState(STORAGE_KEYS.account, null)
  const [region, setRegion] = usePersistentState(STORAGE_KEYS.region, 'LT')
  const [newsletter, setNewsletter] = usePersistentState(STORAGE_KEYS.newsletter, false)
  const [lastOrder, setLastOrder] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(0)

  useEffect(() => {
    document.title = PAGE_TITLES[route] ?? PAGE_TITLES.home
    window.scrollTo(0, 0)
  }, [route])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  // Krepšelis visada sinchronizuojamas su katalogu: ištrintos prekės pašalinamos,
  // o kiekiai apribojami pagal realų sandėlio likutį.
  useEffect(() => {
    setCart((current) => {
      const byId = new Map(products.map((product) => [product.id, product]))
      const reserved = new Map()
      let changed = false
      const next = []
      for (const item of current) {
        const product = byId.get(item.productId)
        if (!product) {
          changed = true
          continue
        }
        const already = reserved.get(product.id) ?? 0
        const qty = Math.min(item.qty, Math.max(0, product.stock - already))
        if (qty <= 0) {
          changed = true
          continue
        }
        if (qty !== item.qty) changed = true
        reserved.set(product.id, already + qty)
        next.push(qty === item.qty ? item : { ...item, qty })
      }
      return changed ? next : current
    })
  }, [products, setCart])

  useEffect(() => {
    if (activeProductId && !products.some((product) => product.id === activeProductId)) {
      setActiveProductId(null)
    }
  }, [products, activeProductId])

  const lines = useMemo(() => buildCartLines(cart, products), [cart, products])
  const totals = useMemo(() => computeTotals(lines), [lines])
  const itemsInCart = cartCount(cart)
  const activeProduct = useMemo(
    () => products.find((product) => product.id === activeProductId) ?? null,
    [products, activeProductId],
  )

  const showToast = useCallback((next) => {
    window.clearTimeout(toastTimer.current)
    setToast({ ...next, id: Date.now() })
    toastTimer.current = window.setTimeout(() => setToast(null), 3400)
  }, [])

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const openProduct = useCallback((productId) => setActiveProductId(productId), [])
  const closeProduct = useCallback(() => setActiveProductId(null), [])

  const addToCart = useCallback(
    (productId, sizeId, qty = 1, { silent = false } = {}) => {
      const product = products.find((item) => item.id === productId)
      if (!product) return false
      const available = product.stock - quantityInCart(cart, productId)
      if (available <= 0) {
        showToast({
          title: 'Daugiau vienetų nėra',
          description: `Krepšelyje jau visi likę „${product.name}“ vienetai`,
          image: product.image,
          action: { label: 'Krepšelis', onClick: () => setCartOpen(true) },
        })
        return false
      }
      const addQty = Math.min(qty, available)
      const size = getSize(product, sizeId)
      const key = `${productId}::${size.id}`
      setCart((current) => {
        const existing = current.find((item) => item.key === key)
        if (existing) {
          return current.map((item) => (item.key === key ? { ...item, qty: item.qty + addQty } : item))
        }
        return [...current, { key, productId, sizeId: size.id, qty: addQty }]
      })
      if (!silent) {
        showToast({
          title: addQty < qty ? `Pridėta tik ${addQty} vnt. — daugiau nėra` : 'Pridėta į krepšelį',
          description: `${product.name} · ${size.label}`,
          image: product.image,
          action: { label: 'Krepšelis', onClick: () => setCartOpen(true) },
        })
      }
      return true
    },
    [products, cart, setCart, showToast],
  )

  const updateQty = useCallback(
    (key, qty) => {
      setCart((current) =>
        qty <= 0 ? current.filter((item) => item.key !== key) : current.map((item) => (item.key === key ? { ...item, qty } : item)),
      )
    },
    [setCart],
  )

  const removeLine = useCallback((key) => setCart((current) => current.filter((item) => item.key !== key)), [setCart])

  const buyNow = useCallback(
    (productId, sizeId, qty) => {
      const added = addToCart(productId, sizeId, qty, { silent: true })
      if (!added && quantityInCart(cart, productId) === 0) return
      setActiveProductId(null)
      setCartOpen(false)
      navigate('checkout')
    },
    [addToCart, cart, navigate],
  )

  const goToCheckout = useCallback(() => {
    setCartOpen(false)
    navigate('checkout')
  }, [navigate])

  const openShop = useCallback(
    (patch = {}) => {
      setShopFilter({ ...EMPTY_FILTER, ...patch })
      navigate('shop')
    },
    [navigate],
  )

  const login = useCallback(
    (nextAccount) => {
      setAccount(nextAccount)
      showToast({ title: `Sveiki, ${nextAccount.name.split(' ')[0]}!`, description: 'Prisijungėte prie Vaidore paskyros' })
    },
    [setAccount, showToast],
  )

  const logout = useCallback(() => {
    setAccount(null)
    setAccountOpen(false)
    showToast({ title: 'Atsijungėte', description: 'Lauksime sugrįžtant' })
  }, [setAccount, showToast])

  const subscribe = useCallback(
    (email) => {
      setNewsletter(true)
      showToast({ title: 'Prenumerata patvirtinta', description: `Nuolaidos kodą išsiuntėme adresu ${email}` })
    },
    [setNewsletter, showToast],
  )

  const placeOrder = useCallback(
    (details) => {
      const order = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        ...details,
        lines: lines.map((line) => ({
          key: line.key,
          productId: line.product.id,
          name: line.product.name,
          sizeLabel: line.size.label,
          qty: line.qty,
          lineTotal: line.lineTotal,
          image: line.product.image,
        })),
      }
      const sold = new Map()
      for (const line of lines) sold.set(line.product.id, (sold.get(line.product.id) ?? 0) + line.qty)

      setProducts((current) =>
        current.map((product) =>
          sold.has(product.id)
            ? {
                ...product,
                stock: Math.max(0, product.stock - sold.get(product.id)),
                popularity: (product.popularity ?? 0) + sold.get(product.id),
              }
            : product,
        ),
      )
      setOrders((current) => [order, ...current].slice(0, 50))
      setCart([])
      setLastOrder(order)
      navigate('success')
    },
    [lines, navigate, setCart, setOrders, setProducts],
  )

  const addProduct = useCallback(
    (product) => {
      setProducts((current) => [product, ...current])
      showToast({
        title: 'Prekė paskelbta parduotuvėje',
        description: product.name,
        image: product.image,
        action: {
          label: 'Peržiūrėti',
          onClick: () => openShop({ category: product.category }),
        },
      })
    },
    [openShop, setProducts, showToast],
  )

  const deleteProduct = useCallback(
    (productId) => {
      const product = products.find((item) => item.id === productId)
      setProducts((current) => current.filter((item) => item.id !== productId))
      if (product) showToast({ title: 'Prekė ištrinta iš katalogo', description: product.name })
    },
    [products, setProducts, showToast],
  )

  const resetDemo = useCallback(() => {
    setProducts(SEED_PRODUCTS)
    setOrders([])
    setCart([])
    setLastOrder(null)
    showToast({ title: 'Demo duomenys atkurti', description: 'Katalogas, krepšelis ir užsakymai grąžinti į pradinę būseną' })
  }, [setCart, setOrders, setProducts, showToast])

  const isCheckout = route === 'checkout'

  let view
  switch (route) {
    case 'shop':
      view = (
        <ShopView
          products={products}
          filter={shopFilter}
          onFilterChange={setShopFilter}
          onOpenProduct={openProduct}
          onAdd={addToCart}
        />
      )
      break
    case 'about':
      view = <AboutView onNavigate={navigate} />
      break
    case 'admin':
      view = (
        <AdminView
          products={products}
          orders={orders}
          onAddProduct={addProduct}
          onDeleteProduct={deleteProduct}
          onResetDemo={resetDemo}
          onOpenProduct={openProduct}
        />
      )
      break
    case 'checkout':
      view = (
        <CheckoutView
          lines={lines}
          onPlaceOrder={placeOrder}
          onBackToCart={openCart}
          onNavigate={navigate}
          defaults={{
            email: account?.email ?? '',
            name: account?.name ?? '',
            country: REGIONS.find((item) => item.code === region)?.country ?? 'Lietuva',
          }}
        />
      )
      break
    case 'success':
      view = <SuccessView order={lastOrder ?? orders[0] ?? null} onNavigate={navigate} />
      break
    case 'reviews':
      view = <ReviewsView products={products} onOpenProduct={openProduct} />
      break
    case 'blog':
      view = <BlogView onShop={openShop} />
      break
    default:
      view = INFO_PAGES[route] ? (
        <InfoView route={route} onNavigate={navigate} />
      ) : (
        <HomeView
          products={products}
          onNavigate={navigate}
          onShop={openShop}
          onOpenProduct={openProduct}
          onAdd={addToCart}
        />
      )
  }

  return (
    <div className={`min-h-dvh bg-white ${isCheckout ? '' : 'pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0'}`}>
      {!isCheckout && <AnnouncementBar />}
      <Header
        route={route}
        shopFilter={shopFilter}
        onNavigate={navigate}
        onShop={openShop}
        cartCount={itemsInCart}
        cartTotal={totals.subtotal}
        onOpenCart={openCart}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        account={account}
        region={region}
        onRegionChange={setRegion}
        minimal={isCheckout}
      />

      <main key={route} className="animate-fade-up [animation-duration:0.5s]">
        {view}
      </main>

      {!isCheckout && (
        <Footer
          onNavigate={navigate}
          onShop={openShop}
          region={region}
          onRegionChange={setRegion}
          newsletter={newsletter}
          onSubscribe={subscribe}
        />
      )}
      {!isCheckout && (
        <TabBar route={route} cartOpen={cartOpen} cartCount={itemsInCart} onNavigate={navigate} onOpenCart={openCart} />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        cart={cart}
        lines={lines}
        totals={totals}
        products={products}
        onUpdateQty={updateQty}
        onRemove={removeLine}
        onAdd={addToCart}
        onCheckout={goToCheckout}
        onBrowse={() => {
          setCartOpen(false)
          openShop()
        }}
        onOpenProduct={(productId) => {
          setCartOpen(false)
          setActiveProductId(productId)
        }}
        account={account}
        onOpenAccount={() => {
          setCartOpen(false)
          setAccountOpen(true)
        }}
      />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onShop={openShop}
        onNavigate={navigate}
        onOpenAccount={() => setAccountOpen(true)}
        account={account}
        region={region}
        onRegionChange={setRegion}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        onOpenProduct={(productId) => {
          setSearchOpen(false)
          setActiveProductId(productId)
        }}
        onSearchAll={(query) => {
          setSearchOpen(false)
          openShop({ query })
        }}
      />

      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        account={account}
        orders={orders}
        onLogin={login}
        onLogout={logout}
      />

      <ProductDetail
        product={activeProduct}
        onClose={closeProduct}
        onAdd={addToCart}
        onBuyNow={buyNow}
        inCartQty={activeProductId ? quantityInCart(cart, activeProductId) : 0}
      />

      <Toast
        toast={toast}
        onDismiss={dismissToast}
        position={activeProductId || cartOpen || searchOpen || accountOpen ? 'top' : 'bottom'}
      />
    </div>
  )
}

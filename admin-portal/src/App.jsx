import React, { useState, useEffect, useCallback, useRef } from 'react'
import { api } from './api/client.js'

// Pages
import AuthForms from './pages/AuthForms.jsx'

// Farmer Pages
import FarmerHome from './pages/farmer/FarmerHome.jsx'
import ProductDetails from './pages/farmer/ProductDetails.jsx'
import CartAndCheckout from './pages/farmer/CartAndCheckout.jsx'
import FarmerOrders from './pages/farmer/FarmerOrders.jsx'
import CropScanner from './pages/farmer/CropScanner.jsx'
import CommunityAndReferral from './pages/farmer/CommunityAndReferral.jsx'
import FarmerSettings from './pages/farmer/FarmerSettings.jsx'

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard.jsx'
import SellerProductCatalog from './pages/seller/SellerProductCatalog.jsx'
import SellerOrders from './pages/seller/SellerOrders.jsx'
import SellerSettings from './pages/seller/SellerSettings.jsx'

// Admin Pages
import Overview from './pages/Overview.jsx'
import ShopManagement from './pages/ShopManagement.jsx'
import ProductCatalog from './pages/ProductCatalog.jsx'
import OrderManager from './pages/OrderManager.jsx'
import UserAccounts from './pages/UserAccounts.jsx'
import ContentManager from './pages/ContentManager.jsx'
import Analytics from './pages/Analytics.jsx'
import AuditLogs from './pages/AuditLogs.jsx'
import Settings from './pages/Settings.jsx'

// Layout Components
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import ToastContainer from './components/layout/ToastContainer.jsx'
import NotifPanel from './components/layout/NotifPanel.jsx'


// ── Theme ─────────────────────────────────────────────────────
const savedTheme = () => localStorage.getItem('agrifarm_theme') || 'dark'

// ── Farmer Category Browser Page ──────────────────────────────
function CategoryBrowser({
  initialCategory,
  addToCart,
  setView,
  setSelectedProductId,
  wishlist = [],
  toggleWishlist
}) {
  const [category, setCategory] = useState(initialCategory || 'Seeds')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating') // rating | price_asc | price_desc
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    loadCategoryProducts()
  }, [category, sortBy, minPrice, maxPrice])

  const loadCategoryProducts = async () => {
    setLoading(true)
    try {
      const params = { category }
      if (search) params.search = search
      if (sortBy) params.sortBy = sortBy
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice

      const list = await api.getProducts(params)
      setProducts(list || [])
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (productId) => {
    setSelectedProductId(productId)
    setView('product-details')
  }

  return (
    <div className="farmer-dashboard">
      <style>{`
        .cat-browse-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          margin-top: 20px;
        }
        @media (max-width: 768px) {
          .cat-browse-layout {
            grid-template-columns: 1fr;
          }
        }
        .filter-sidebar {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          height: fit-content;
        }
        .filter-group {
          margin-bottom: 20px;
        }
        .filter-group h4 {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          margin-bottom: 10px;
          color: var(--text);
        }
        .category-pill-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cat-pill-btn {
          background: none;
          border: 1px solid var(--border);
          border-radius: var(--radius-xs);
          padding: 8px 12px;
          text-align: left;
          color: var(--text2);
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .cat-pill-btn:hover, .cat-pill-btn.active {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-a);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>🌾 Crop Resource Catalog</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>⬅️ Back to Home</button>
      </div>

      <div className="cat-browse-layout">
        {/* Filter Sidebar */}
        <div className="filter-sidebar">
          <div className="filter-group">
            <h4>Farming Categories</h4>
            <div className="category-pill-list">
              {['Seeds', 'Fertilizers', 'Pesticides', 'Weed Killers', 'Tools', 'Other'].map((c) => (
                <button
                  key={c}
                  className={`cat-pill-btn ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price Range (INR)</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                className="login-input"
                style={{ fontSize: '0.8rem', padding: '6px' }}
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>-</span>
              <input
                className="login-input"
                style={{ fontSize: '0.8rem', padding: '6px' }}
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <h4>Sort Catalog By</h4>
            <select
              className="login-input"
              style={{ fontSize: '0.8rem', padding: '6px', background: 'var(--bg3)', border: '1px solid var(--border)' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrival</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg2)', borderRadius: 'var(--radius-xs)', padding: '10px 16px', fontSize: '0.85rem' }}
              type="text"
              placeholder={`Search within ${category}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={loadCategoryProducts}>Search</button>
          </div>

          {loading ? (
            <div className="loading" style={{ padding: '60px 0', textDecoration: 'none' }}>⏳ Sorting resources...</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '40px', color: 'var(--text3)', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              No crop items listed in this segment matching your filter.
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <button
                    className={`wishlist-btn ${wishlist.includes(p.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(p.id)}
                  >
                    ❤️
                  </button>

                  <div className="product-image" onClick={() => handleProductClick(p.id)} style={{ cursor: 'pointer' }}>
                    {p.imageUrl ? (
                      <img src={`http://localhost:3000/${p.imageUrl}`} alt={p.name} onError={(e)=>{e.target.style.display='none'; e.target.parentNode.textContent='📦'}} />
                    ) : (
                      '📦'
                    )}
                  </div>

                  <div className="product-info">
                    <span className="product-category">{p.category}</span>
                    <h4 className="product-title" onClick={() => handleProductClick(p.id)} style={{ cursor: 'pointer' }}>{p.name}</h4>

                    <div className="product-rating">
                      ⭐ {p.rating || '5.0'} <span style={{ color: 'var(--text3)' }}>({p.total_reviews || 0})</span>
                    </div>

                    <div className="product-bottom-row">
                      <span className="product-price">₹{parseFloat(p.price).toFixed(2)}</span>
                      <button
                        className="add-cart-btn"
                        disabled={p.stock <= 0}
                        onClick={() => addToCart(p)}
                      >
                        {p.stock > 0 ? '➕ Add' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(sessionStorage.getItem('agrifarm_token') || sessionStorage.getItem('agrifarm_admin_token') || '')
  const [role, setRole] = useState(sessionStorage.getItem('agrifarm_role') || (sessionStorage.getItem('agrifarm_admin_token') ? 'ADMIN' : ''))
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('agrifarm_user') || 'null')
    } catch(e) {
      return null
    }
  })

  // View States for portals
  const [activeTab, setActiveTab] = useState('overview') // ADMIN specific
  const [farmerView, setFarmerView] = useState('home') // home | product-details | categories | cart | orders | crop-scanner | community | settings
  const [sellerView, setSellerView] = useState('dashboard') // dashboard | products | orders | settings
  
  // Parameter Passing States
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Seeds')
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState('')
  
  // Shopping Cart & Wishlist State
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('agrifarm_cart')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  })
  const [wishlist, setWishlist] = useState([])

  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState(savedTheme)
  const [showNotif, setShowNotif] = useState(false)

  // ── Data State (Admin specific) ──────────────────────────────
  const [dashboard, setDashboard]   = useState(null)
  const [shops, setShops]           = useState([])
  const [products, setProducts]     = useState([])
  const [orders, setOrders]         = useState([])
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh]   = useState(null)

  // ── Toast ─────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const showToast = useCallback((msg, type = 'success') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // ── Theme effect ──────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('agrifarm_theme', theme)
  }, [theme])

  // ── Cart persistence effect ─────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('agrifarm_cart', JSON.stringify(cart))
  }, [cart])

  // ── Restore wishlist on login (Farmer) ────────────────────────
  useEffect(() => {
    if (token && role === 'FARMER') {
      api.getWishlist()
        .then(list => setWishlist(list.map(w => w.productId)))
        .catch(err => console.error(err))
    }
  }, [token, role])

  // ── Load all data (Admin specific) ────────────────────────────
  const loadAll = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setIsRefreshing(true)
    try {
      const [dash, shopList, productList, orderList, userList] = await Promise.allSettled([
        api.getDashboard(),
        api.getAdminShops({ limit: 200 }),
        api.getProducts(),
        api.getOrders(),
        api.getUsers(),
      ])
      if (dash.status       === 'fulfilled') setDashboard(dash.value)
      if (shopList.status   === 'fulfilled') setShops((shopList.value.shops || []))
      if (productList.status === 'fulfilled') setProducts(Array.isArray(productList.value) ? productList.value : [])
      if (orderList.status  === 'fulfilled') setOrders(Array.isArray(orderList.value) ? orderList.value : [])
      if (userList.status   === 'fulfilled') setUsers(Array.isArray(userList.value) ? userList.value : [])
      setLastRefresh(new Date())
    } catch(e) {
      showToast('Failed to load data: ' + e.message, 'error')
    }
    setLoading(false)
    setIsRefreshing(false)
  }, [showToast])

  useEffect(() => {
    if (token && role === 'ADMIN') loadAll()
  }, [token, role, loadAll])

  // Auto-refresh every 60 seconds (Admin)
  useEffect(() => {
    if (!token || role !== 'ADMIN') return
    const id = setInterval(() => loadAll(true), 60000)
    return () => clearInterval(id)
  }, [token, role, loadAll])

  // ── Notifications computed from data (Admin) ──────────────────
  const notifications = React.useMemo(() => {
    if (role !== 'ADMIN') return []
    const notifs = []
    const pending = shops.filter(s => s.status === 'PENDING').length
    if (pending > 0) notifs.push({ msg: `${pending} shop${pending > 1 ? 's' : ''} awaiting approval`, type: 'warn' })
    const outOfStock = products.filter(p => p.stock === 0).length
    if (outOfStock > 0) notifs.push({ msg: `${outOfStock} product${outOfStock > 1 ? 's are' : ' is'} out of stock`, type: 'danger' })
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
    if (lowStock > 0) notifs.push({ msg: `${lowStock} product${lowStock > 1 ? 's have' : ' has'} very low stock (≤5)`, type: 'warn' })
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length
    if (pendingOrders > 0) notifs.push({ msg: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} pending processing`, type: 'info' })
    const blocked = users.filter(u => u.blocked_at).length
    if (blocked > 0) notifs.push({ msg: `${blocked} user account${blocked > 1 ? 's are' : ' is'} currently blocked`, type: 'info' })
    return notifs
  }, [shops, products, orders, users, role])

  // ── Cart Helpers (Farmer) ────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    showToast(`${product.name} added to cart!`, 'success')
  }

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
    showToast('Item removed from cart', 'info')
  }

  const clearCart = () => setCart([])

  const handleToggleWishlist = async (productId) => {
    try {
      const res = await api.toggleWishlist(productId)
      if (res.wishlisted) {
        setWishlist(prev => [...prev, productId])
        showToast('Added to Wishlist!', 'success')
      } else {
        setWishlist(prev => prev.filter(id => id !== productId))
        showToast('Removed from Wishlist', 'info')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // ── Auth handlers ─────────────────────────────────────────────
  const handleLogin = (data) => {
    setToken(data.accessToken)
    setRole(data.role)
    setUserData(data)
    
    // Set default views
    if (data.role === 'FARMER') {
      setFarmerView('home')
    } else if (data.role === 'SHOP_OWNER') {
      setSellerView('dashboard')
    } else if (data.role === 'ADMIN') {
      setActiveTab('overview')
    }
    showToast(`Welcome back, ${data.name}!`, 'success')
  }

  const handleLogout = () => {
    api.logout().catch(() => {})
    sessionStorage.removeItem('agrifarm_token')
    sessionStorage.removeItem('agrifarm_admin_token')
    sessionStorage.removeItem('agrifarm_role')
    sessionStorage.removeItem('agrifarm_user')
    setToken('')
    setRole('')
    setUserData(null)
    setDashboard(null)
    setShops([]); setProducts([]); setOrders([]); setUsers([])
    clearCart()
    setWishlist([])
    showToast('Signed out successfully', 'info')
  }

  const handleProfileUpdate = (updatedUser) => {
    setUserData(prev => ({ ...prev, ...updatedUser }))
  }

  // ── Render Portals based on Role ──────────────────────────────
  if (!token) return (
    <>
      <ToastContainer toasts={toasts} />
      <AuthForms onLoginSuccess={handleLogin} />
    </>
  )

  // 1. Farmer Render Layout
  if (role === 'FARMER') {
    const renderFarmerPage = () => {
      switch (farmerView) {
        case 'home':
          return (
            <FarmerHome
              user={userData}
              cart={cart}
              addToCart={addToCart}
              setView={setFarmerView}
              setSelectedProductId={setSelectedProductId}
              setSelectedCategory={setSelectedCategory}
              onLogout={handleLogout}
            />
          )
        case 'product-details':
          return (
            <ProductDetails
              productId={selectedProductId}
              addToCart={addToCart}
              setView={setFarmerView}
              wishlist={wishlist}
              toggleWishlist={handleToggleWishlist}
            />
          )
        case 'categories':
          return (
            <CategoryBrowser
              initialCategory={selectedCategory}
              addToCart={addToCart}
              setView={setFarmerView}
              setSelectedProductId={setSelectedProductId}
              wishlist={wishlist}
              toggleWishlist={handleToggleWishlist}
            />
          )
        case 'cart':
          return (
            <CartAndCheckout
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              setView={setFarmerView}
              user={userData}
              setLastPlacedOrderId={setLastPlacedOrderId}
            />
          )
        case 'orders':
          return (
            <FarmerOrders
              user={userData}
              setView={setFarmerView}
              lastPlacedOrderId={lastPlacedOrderId}
            />
          )
        case 'crop-scanner':
          return (
            <CropScanner
              setView={setFarmerView}
              setSelectedProductId={setSelectedProductId}
            />
          )
        case 'community':
          return (
            <CommunityAndReferral
              user={userData}
              setView={setFarmerView}
            />
          )
        case 'settings':
          return (
            <FarmerSettings
              user={userData}
              setView={setFarmerView}
              theme={theme}
              onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              onProfileUpdate={handleProfileUpdate}
            />
          )
        default:
          return <FarmerHome user={userData} cart={cart} addToCart={addToCart} setView={setFarmerView} setSelectedProductId={setSelectedProductId} onLogout={handleLogout} />
      }
    }

    return (
      <div className="farmer-shell">
        <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setFarmerView('home')}>
            <span style={{ fontSize: '1.8rem' }}>🌱</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>AgriFarm Buyer</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>🌾 Farmer Account</span>
            <button className="btn btn-secondary btn-xs" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg)', paddingBottom: '40px' }}>
          {renderFarmerPage()}
        </main>
        <ToastContainer toasts={toasts} />
      </div>
    )
  }

  // 2. Shop Owner Render Layout
  if (role === 'SHOP_OWNER') {
    const renderSellerPage = () => {
      switch (sellerView) {
        case 'dashboard':
          return <SellerDashboard user={userData} setView={setSellerView} onLogout={handleLogout} />
        case 'products':
          return <SellerProductCatalog user={userData} setView={setSellerView} />
        case 'orders':
          return <SellerOrders user={userData} setView={setSellerView} />
        case 'settings':
          return (
            <SellerSettings
              user={userData}
              setView={setSellerView}
              theme={theme}
              onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              onProfileUpdate={handleProfileUpdate}
            />
          )
        default:
          return <SellerDashboard user={userData} setView={setSellerView} onLogout={handleLogout} />
      }
    }

    return (
      <div className="seller-shell">
        <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setSellerView('dashboard')}>
            <span style={{ fontSize: '1.8rem' }}>🏪</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>AgriFarm Merchant</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>🏪 Shop Owner Account</span>
            <button className="btn btn-secondary btn-xs" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--bg)', paddingBottom: '40px' }}>
          {renderSellerPage()}
        </main>
        <ToastContainer toasts={toasts} />
      </div>
    )
  }

  // 3. Admin Render Layout (Original codebase flow)
  const pendingShops  = shops.filter(s => s.status === 'PENDING').length
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length

  const pageProps = { showToast, onRefresh: () => loadAll(true), loading }

  const renderPage = () => {
    switch(activeTab) {
      case 'overview':   return <Overview dashboard={dashboard} loading={loading} />
      case 'shops':      return <ShopManagement shops={shops} users={users} {...pageProps} />
      case 'products':   return <ProductCatalog products={products} shops={shops} {...pageProps} />
      case 'orders':     return <OrderManager orders={orders} {...pageProps} />
      case 'users':      return <UserAccounts users={users} {...pageProps} />
      case 'content':    return <ContentManager showToast={showToast} />
      case 'analytics':  return <Analytics dashboard={dashboard} />
      case 'audit':      return <AuditLogs />
      case 'settings':   return <Settings theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} adminEmail={userData?.email || 'admin@agrifarm.com'} adminUid={userData?.uid || null} />
      default:           return <Overview dashboard={dashboard} loading={loading} />
    }
  }

  return (
    <div className="admin-shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pendingShops={pendingShops}
        pendingOrders={pendingOrders}
      />

      <TopBar
        activeTab={activeTab}
        collapsed={collapsed}
        adminEmail={userData?.email || 'admin@agrifarm.com'}
        lastRefresh={lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={() => loadAll(true)}
        notifications={notifications}
        onNotif={() => setShowNotif(s => !s)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <main className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        {renderPage()}
      </main>

      {showNotif && <NotifPanel notifications={notifications} onClose={() => setShowNotif(false)} />}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function FarmerHome({
  user,
  cart,
  addToCart,
  setView,
  setSelectedProductId,
  setSelectedCategory,
  onLogout
}) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState([])
  const [mandiPrices, setMandiPrices] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState('Salem')
  const [districts, setDistricts] = useState(['Salem', 'Coimbatore', 'Kumbakonam', 'Trichy', 'Madurai'])
  const [notifications, setNotifications] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    loadMandiPrices()
  }, [selectedDistrict])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Get products (limit to first 10 for dashboard)
      const prodList = await api.getProducts()
      setProducts(prodList || [])

      // 2. Get Weather
      const weatherList = await api.getPublicWeather()
      setWeather(weatherList || [])

      // 3. Get Notifications
      const notifs = await api.getNotifications().catch(() => [])
      setNotifications(notifs || [])

      // 4. Get Wishlist
      const wish = await api.getWishlist().catch(() => [])
      setWishlist(wish.map(w => w.productId))
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMandiPrices = async () => {
    try {
      const prices = await api.getPublicMandiPrices(selectedDistrict)
      setMandiPrices(prices || [])
    } catch (err) {
      console.error('Error loading mandi prices:', err)
    }
  }

  const handleToggleWishlist = async (productId) => {
    try {
      const res = await api.toggleWishlist(productId)
      if (res.wishlisted) {
        setWishlist(prev => [...prev, productId])
      } else {
        setWishlist(prev => prev.filter(id => id !== productId))
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    }
  }

  const handleProductClick = (productId) => {
    setSelectedProductId(productId)
    setView('product-details')
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category)
    setView('categories')
  }

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const activeWeatherAlerts = weather.filter(w => w.is_alert)

  return (
    <div className="farmer-dashboard">
      <style>{`
        .farmer-dashboard {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          color: var(--text);
        }
        .farmer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }
        .farmer-welcome h1 {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          color: var(--text);
        }
        .farmer-welcome p {
          color: var(--text2);
          font-size: 0.95rem;
          margin-top: 4px;
        }
        .farmer-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nav-search-bar {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 10px 20px;
          color: var(--text);
          font-size: 0.9rem;
          width: 300px;
          transition: var(--transition);
        }
        .nav-search-bar:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: var(--shadow-glow);
        }
        .nav-icon-btn {
          background: var(--bg2);
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          color: var(--text);
          font-size: 1.2rem;
          transition: var(--transition);
        }
        .nav-icon-btn:hover {
          background: var(--primary-a);
          border-color: var(--primary);
          color: var(--primary);
        }
        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--danger);
          color: white;
          border-radius: var(--radius-full);
          padding: 2px 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .weather-banner {
          background: linear-gradient(135deg, hsl(158, 72%, 24%) 0%, hsl(220, 18%, 8%) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .weather-banner-content {
          z-index: 2;
          position: relative;
        }
        .weather-alert-badge {
          background: var(--danger);
          color: white;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 12px;
          animation: pulse 2s infinite;
        }
        .weather-temp-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }
        .weather-temp {
          font-family: var(--font-heading);
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
        }
        .weather-desc {
          color: white;
          opacity: 0.9;
        }
        .weather-forecast-row {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .forecast-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 10px;
          min-width: 70px;
          text-align: center;
          color: white;
        }
        .forecast-card .day {
          font-size: 0.8rem;
          opacity: 0.7;
          text-transform: uppercase;
        }
        .forecast-card .icon {
          font-size: 1.5rem;
          margin: 6px 0;
        }
        .forecast-card .temp {
          font-weight: 600;
        }
        .categories-section {
          margin-bottom: 32px;
        }
        .section-header {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--text);
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 16px;
        }
        .category-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .category-card:hover {
          border-color: var(--primary);
          background: var(--primary-a);
          transform: translateY(-2px);
        }
        .category-icon {
          font-size: 2.2rem;
          margin-bottom: 10px;
        }
        .category-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .product-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
        .product-image {
          height: 140px;
          background: var(--bg3);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--text3);
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          transition: var(--transition);
          z-index: 5;
        }
        .wishlist-btn.active {
          color: var(--danger);
          background: rgba(255,255,255,0.9);
        }
        .product-info {
          padding: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .product-category {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text3);
          font-weight: 600;
        }
        .product-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 4px 0 8px 0;
          color: var(--text);
          height: 38px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .product-rating {
          font-size: 0.8rem;
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }
        .product-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .product-price {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text);
        }
        .add-cart-btn {
          background: var(--primary);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .add-cart-btn:hover {
          background: var(--primary-h);
        }
        .add-cart-btn:disabled {
          background: var(--bg3);
          color: var(--text3);
          cursor: not-allowed;
        }
        .side-widget {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 24px;
        }
        .mandi-list {
          margin-top: 14px;
        }
        .mandi-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
          align-items: center;
        }
        .mandi-row:last-child {
          border-bottom: none;
        }
        .mandi-crop {
          font-weight: 600;
        }
        .mandi-variety {
          color: var(--text2);
        }
        .mandi-trend {
          text-align: right;
          font-weight: 700;
        }
        .trend-up { color: var(--primary); }
        .trend-down { color: var(--danger); }
        .trend-stable { color: var(--text3); }

        .quick-action-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px 18px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .quick-action-card:hover {
          border-color: var(--primary);
          background: var(--primary-a);
          transform: translateX(4px);
        }
        .quick-action-icon {
          font-size: 1.8rem;
        }
        .quick-action-info h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
        }
        .quick-action-info p {
          font-size: 0.75rem;
          color: var(--text2);
          margin-top: 2px;
        }
        .notif-overlay-home {
          position: absolute;
          top: 72px;
          right: 24px;
          width: 320px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          padding: 16px;
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .notif-header h4 {
          font-family: var(--font-heading);
          font-size: 1rem;
        }
        .notif-list {
          max-height: 250px;
          overflow-y: auto;
        }
        .notif-home-item {
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.8rem;
        }
        .notif-home-item:last-child {
          border-bottom: none;
        }
        .notif-home-item.unread {
          font-weight: 600;
          border-left: 2px solid var(--primary);
          padding-left: 6px;
        }
        .notif-time {
          font-size: 0.7rem;
          color: var(--text3);
          margin-top: 4px;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Header Area */}
      <div className="farmer-header">
        <div className="farmer-welcome">
          <h1>Hello, {user.name} 👋</h1>
          <p>Harvest time in Salem, Tamil Nadu! Let's find your farming resources.</p>
        </div>

        <div className="farmer-nav-actions">
          <input
            id="farmer-search-bar"
            data-testid="farmer-search-bar"
            className="nav-search-bar"
            type="text"
            placeholder="Search seeds, fertilizers, tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button id="farmer-cart-btn" data-testid="farmer-cart-btn" className="nav-icon-btn" onClick={() => setView('cart')}>
            🛒
            {cart.length > 0 && <span className="badge">{cart.reduce((a,c) => a + c.quantity, 0)}</span>}
          </button>

          <button id="farmer-notif-btn" data-testid="farmer-notif-btn" className="nav-icon-btn" onClick={() => setShowNotifPanel(!showNotifPanel)}>
            🔔
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.is_read).length}</span>
            )}
          </button>

          <button id="farmer-orders-btn" data-testid="farmer-orders-btn" className="nav-icon-btn" onClick={() => setView('orders')}>
            📋
          </button>

          <button id="farmer-settings-btn" data-testid="farmer-settings-btn" className="nav-icon-btn" onClick={() => setView('settings')}>
            ⚙️
          </button>

          <button id="logout-btn" data-testid="logout-btn" className="btn btn-secondary btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {showNotifPanel && (
        <div className="notif-overlay-home">
          <div className="notif-header">
            <h4>Alert Notifications</h4>
            <button className="btn btn-xs" onClick={handleMarkNotificationsRead}>Clear All</button>
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', padding: '10px 0' }}>No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-home-item ${n.is_read ? '' : 'unread'}`}>
                  <div>{n.title}</div>
                  <div style={{ color: 'var(--text2)', marginTop: '2px' }}>{n.body}</div>
                  <div className="notif-time">{new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Weather, Categories, and Products */}
        <div>
          {/* Weather Alert banner */}
          <div className="weather-banner">
            <div className="weather-banner-content">
              {activeWeatherAlerts.length > 0 && (
                <span className="weather-alert-badge">⚠️ WEATHER WARNING: Heavy Rain Alert</span>
              )}
              <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                📍 Kumbakonam, Tamil Nadu
              </div>
              <div className="weather-temp-row">
                <span style={{ fontSize: '3rem' }}>☀️</span>
                <span className="weather-temp">32°C</span>
                <div className="weather-desc">
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Sunny Interval</div>
                  <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>High humidity. Spray in evening.</div>
                </div>
              </div>
            </div>

            <div className="weather-forecast-row">
              {weather.map((w, index) => (
                <div key={w.id || index} className="forecast-card">
                  <div className="day">{w.day_name}</div>
                  <div className="icon">
                    {w.condition_icon === 'WbSunny' ? '☀️' : w.condition_icon === 'Cloud' ? '☁️' : '🌧️'}
                  </div>
                  <div className="temp">{w.temp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Row */}
          <div className="categories-section">
            <div className="section-header">
              <h3>Browse Resource Categories</h3>
            </div>
            <div className="categories-grid">
              {[
                { name: 'Seeds', icon: '🌱' },
                { name: 'Fertilizers', icon: '🍂' },
                { name: 'Pesticides', icon: '🧴' },
                { name: 'Weed Killers', icon: '🧪' },
                { name: 'Tools', icon: '🛠️' },
                { name: 'Other', icon: '📦' }
              ].map((c) => (
                <div key={c.name} className="category-card" onClick={() => handleCategoryClick(c.name)}>
                  <div className="category-icon">{c.icon}</div>
                  <div className="category-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Resources */}
          <div>
            <div className="section-header">
              <h3>Recommended Products</h3>
            </div>

            {loading ? (
              <div className="loading" style={{ padding: '60px 0', textDecoration: 'none' }}>⏳ Fetching farming resources...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '40px', color: 'var(--text3)', textAlign: 'center' }}>No products found matching your search.</div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="product-card">
                    <button
                      className={`wishlist-btn ${wishlist.includes(p.id) ? 'active' : ''}`}
                      onClick={() => handleToggleWishlist(p.id)}
                    >
                      ❤️
                    </button>
                    
                    <div className="product-image" onClick={() => handleProductClick(p.id)} style={{ cursor: 'pointer' }}>
                      {p.imageUrl ? (
                        <img src={`${api.getProducts.name ? 'http://localhost:3000/' : ''}${p.imageUrl}`} alt={p.name} onError={(e)=>{e.target.style.display='none'; e.target.parentNode.textContent='📦'}} />
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

        {/* Right Side Widgets: Mandi Prices, Quick Actions */}
        <div>
          {/* Mandi Prices widget */}
          <div className="side-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>🌾 Mandi Crop Prices</h3>
              <select
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontSize: '0.8rem', padding: '2px 6px' }}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="mandi-list">
              {mandiPrices.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>No mandi prices found for {selectedDistrict}</div>
              ) : (
                mandiPrices.map((m) => (
                  <div key={m.id} className="mandi-row">
                    <div>
                      <div className="mandi-crop">{m.crop_name}</div>
                      <div className="mandi-variety">{m.variety}</div>
                    </div>
                    <div style={{ fontWeight: '600' }}>
                      ₹{m.min_price} - {m.max_price}/q
                    </div>
                    <div className={`mandi-trend ${m.trend === 'UP' ? 'trend-up' : m.trend === 'DOWN' ? 'trend-down' : 'trend-stable'}`}>
                      {m.trend === 'UP' ? '▲' : m.trend === 'DOWN' ? '▼' : '●'} ₹{Math.abs(m.price_change)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '16px' }}>🛠️ Quick Utilities</h3>
            
            <div className="quick-action-card" onClick={() => setView('crop-scanner')}>
              <div className="quick-action-icon">📸</div>
              <div className="quick-action-info">
                <h4>Crop Disease Scanner</h4>
                <p>Upload a leaf image to diagnose crop diseases and find remedies.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => setView('community')}>
              <div className="quick-action-icon">💬</div>
              <div className="quick-action-info">
                <h4>Farmer Community Feed</h4>
                <p>Discuss, ask questions, and share crop guidelines with experts.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => setView('referral')}>
              <div className="quick-action-icon">🎁</div>
              <div className="quick-action-info">
                <h4>Referrals & Rewards</h4>
                <p>Share code with fellow farmers to unlock discount vouchers.</p>
              </div>
            </div>

            <div className="quick-action-card" onClick={() => setView('support')}>
              <div className="quick-action-icon">📞</div>
              <div className="quick-action-info">
                <h4>Customer Support</h4>
                <p>Chat directly with sellers or get assistance from helpdesk.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

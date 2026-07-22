import React, { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function SellerDashboard({ user, setView, onLogout }) {
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Fetch all shops to find owner's shop
      const allShops = await api.getShops()
      const myShop = allShops.find(s => s.ownerId === user.uid)
      setShop(myShop || null)

      // 2. Fetch products and orders if shop exists
      if (myShop) {
        const allProducts = await api.getProducts({ shopId: myShop.id })
        setProducts(allProducts || [])

        // API client lists orders, role-filtered automatically in backend
        const allOrders = await api.getOrders({ shopId: myShop.id })
        setOrders(allOrders || [])
      }
    } catch (err) {
      console.error('Error loading seller dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculations
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED')
  const totalEarnings = deliveredOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount), 0)
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  if (loading) {
    return <div className="loading" style={{ padding: '80px', textDecoration: 'none' }}>⏳ Aggregating shop analytics and earnings...</div>
  }

  if (!shop) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text)' }}>
        <span style={{ fontSize: '4rem' }}>🏪</span>
        <h2 style={{ marginTop: '20px', fontFamily: 'var(--font-heading)' }}>No Shop Registered</h2>
        <p style={{ color: 'var(--text2)', margin: '12px 0 24px 0' }}>Your shop owner account has not completed setup. Please register your store.</p>
        <button className="btn btn-primary" onClick={() => setView('settings')}>Complete Shop Profile</button>
      </div>
    )
  }

  return (
    <div className="seller-dashboard">
      <style>{`
        .seller-dashboard {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          color: var(--text);
        }
        .seller-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }
        .shop-info-bar {
          background: linear-gradient(135deg, hsl(220, 18%, 10%) 0%, hsl(220, 16%, 13%) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 24px;
        }
        .shop-profile-pic {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-sm);
          background: var(--bg3);
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }
        .shop-profile-pic img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .metric-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .metric-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text3);
          font-weight: 700;
        }
        .metric-val {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text);
          margin-top: 8px;
        }
        .metric-val.earnings { color: var(--primary); }
        .metric-sub {
          font-size: 0.75rem;
          color: var(--text2);
          margin-top: 4px;
        }
        .analytics-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 900px) {
          .analytics-row {
            grid-template-columns: 1fr;
          }
        }
        .sales-chart-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
        }
        .bar-chart-container {
          height: 200px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 24px;
          border-bottom: 1.5px solid var(--border);
          padding: 0 16px;
        }
        .chart-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 14%;
        }
        .chart-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(180deg, var(--primary) 0%, var(--primary-d) 100%);
          transition: height 0.5s ease-in-out;
          cursor: pointer;
        }
        .chart-bar:hover {
          background: var(--primary-h);
        }
        .chart-month {
          font-size: 0.75rem;
          color: var(--text3);
          margin-top: 8px;
          font-weight: 600;
        }
        .recent-orders-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
        }
      `}</style>

      {/* Top Header */}
      <div className="seller-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>🏪 Merchant Dashboard</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.95rem', marginTop: '4px' }}>Welcome back, {user.name}. Here is your shop activity summary.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button id="seller-nav-products" data-testid="seller-nav-products" className="btn btn-primary btn-sm" onClick={() => setView('products')}>
            📦 Products List
          </button>
          <button id="seller-nav-orders" data-testid="seller-nav-orders" className="btn btn-primary btn-sm" onClick={() => setView('orders')}>
            📋 Orders Received
          </button>
          <button id="seller-nav-settings" data-testid="seller-nav-settings" className="btn btn-secondary btn-sm" onClick={() => setView('settings')}>
            ⚙️ Edit Shop
          </button>
          <button id="logout-btn" data-testid="logout-btn" className="btn btn-secondary btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Shop Profile Banner */}
      <div className="shop-info-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="shop-profile-pic">
            {shop.imageUrl ? (
              <img src={`http://localhost:3000/${shop.imageUrl}`} alt={shop.name} onError={(e)=>{e.target.style.display='none'; e.target.parentNode.textContent='🏪'}} />
            ) : (
              '🏪'
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>{shop.name}</h2>
            <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '2px' }}>Category: <strong>{shop.category}</strong> | Address: {shop.address}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '4px' }}>Rating: {shop.rating} ★ | Status: <span className="status-badge-mini status-CONFIRMED">{shop.status}</span></div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Owner Login Account:</div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)', marginTop: '2px' }}>{user.email}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Total Earnings</span>
          <span className="metric-val earnings">₹{totalEarnings.toFixed(2)}</span>
          <span className="metric-sub">From {deliveredOrders.length} completed orders</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Orders</span>
          <span className="metric-val">{orders.length}</span>
          <span className="metric-sub">{pendingOrders} pending confirmation</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Listed Crops</span>
          <span className="metric-val">{products.length}</span>
          <span className="metric-sub">{outOfStockCount} items out of stock</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Shop Status</span>
          <span className="metric-val" style={{ color: 'var(--accent)', fontSize: '1.6rem', marginTop: '12px' }}>{shop.status}</span>
          <span className="metric-sub">Verified seller license</span>
        </div>
      </div>

      {/* Analytics & Recent orders row */}
      <div className="analytics-row">
        {/* Sales Chart */}
        <div className="sales-chart-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>📈 Monthly Sales Distribution</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '2px' }}>Mocked values showing crop purchase trend (INR)</p>

          <div className="bar-chart-container">
            {[
              { m: 'FEB', val: '40%', amount: '₹12,400' },
              { m: 'MAR', val: '65%', amount: '₹22,100' },
              { m: 'APR', val: '85%', amount: '₹34,000' },
              { m: 'MAY', val: '50%', amount: '₹18,500' },
              { m: 'JUN', val: '75%', amount: '₹28,600' },
              { m: 'JUL', val: '95%', amount: '₹41,200' }
            ].map((bar, idx) => (
              <div key={idx} className="chart-bar-col">
                <div style={{ fontSize: '0.7rem', color: 'var(--text2)', marginBottom: '6px' }}>{bar.amount}</div>
                <div className="chart-bar" style={{ height: bar.val }} title={bar.amount} />
                <div className="chart-month">{bar.m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Side Card */}
        <div className="recent-orders-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '16px' }}>📋 Recent Orders</h3>
          
          {orders.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: '0.85rem', padding: '20px 0', textAlign: 'center' }}>No orders received yet</div>
          ) : (
            <table className="table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.orderId} style={{ cursor: 'pointer' }} onClick={() => setView('orders')}>
                    <td style={{ fontWeight: '600' }}>{o.orderId}</td>
                    <td>₹{parseFloat(o.totalAmount).toFixed(2)}</td>
                    <td><span className={`status-badge-mini status-${o.status}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

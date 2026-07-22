// pages/Overview.jsx
import React from 'react'

function StatCard({ value, label, icon, sub, color = 'green' }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-top">
        <div>
          <div className="stat-card-value">{value}</div>
          <div className="stat-card-label">{label}</div>
        </div>
        <div className="stat-card-icon">{icon}</div>
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}

function BarChart({ title, data, color = 'var(--primary)' }) {
  if (!data || data.length === 0) return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="chart-empty">No data available</div>
    </div>
  )
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="bar-chart-group">
        {data.map((d, i) => (
          <div className="bar-row" key={i}>
            <div className="bar-label" title={d.label}>{d.label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: d.color || color }}>
                {d.value > 0 && <span className="bar-val">{d.display || d.value}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentList({ title, items, emptyMsg }) {
  return (
    <div className="data-card">
      <div className="data-card-header"><h3>{title}</h3></div>
      <div className="activity-list">
        {items.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">📭</div><p>{emptyMsg}</p></div>
          : items.map((item, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-icon">{item.icon}</div>
              <div className="activity-info">
                <div className="activity-title">{item.title}</div>
                <div className="activity-sub">{item.sub}</div>
              </div>
              <div className="activity-time">{item.time}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default function Overview({ dashboard, loading }) {
  if (loading) return (
    <div>
      <div className="stats-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="stat-card"><div className="skeleton" style={{ height: 80 }} /></div>
        ))}
      </div>
    </div>
  )

  const d = dashboard || {}
  const shops    = d.shops    || { total: 0, pending: 0, approved: 0 }
  const users    = d.users    || { total: 0, farmers: 0, sellers: 0, blocked: 0 }
  const products = d.products || { total: 0, outOfStock: 0, lowStock: 0 }
  const orders   = d.orders   || { total: 0, pending: 0, revenue: 0, monthlyRevenue: 0 }
  const recentShops  = d.recentShops  || []
  const recentUsers  = d.recentUsers  || []
  const recentOrders = d.recentOrders || []

  const fmtMoney = v => `₹${Number(v || 0).toLocaleString('en-IN')}`
  const fmtDate  = v => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'

  const statusChips = {
    PENDING:    <span className="badge badge-yellow">Pending</span>,
    APPROVED:   <span className="badge badge-green">Approved</span>,
    REJECTED:   <span className="badge badge-red">Rejected</span>,
    SUSPENDED:  <span className="badge badge-gray">Suspended</span>,
    DELIVERED:  <span className="badge badge-green">Delivered</span>,
    CANCELLED:  <span className="badge badge-red">Cancelled</span>,
    CONFIRMED:  <span className="badge badge-blue">Confirmed</span>,
    PROCESSING: <span className="badge badge-blue">Processing</span>,
    SHIPPED:    <span className="badge badge-purple">Shipped</span>,
    FARMER:     <span className="badge badge-green">Farmer</span>,
    SHOP_OWNER: <span className="badge badge-blue">Seller</span>,
    ADMIN:      <span className="badge badge-purple">Admin</span>,
  }

  const shopBarData = [
    { label: 'Approved', value: shops.approved, color: 'var(--primary)' },
    { label: 'Pending',  value: shops.pending,  color: 'var(--warning)' },
    { label: 'Total',    value: shops.total,    color: 'var(--info)' },
  ]
  const productBarData = [
    { label: 'Active',      value: products.total - products.outOfStock, color: 'var(--primary)' },
    { label: 'Low Stock',   value: products.lowStock, color: 'var(--warning)' },
    { label: 'Out of Stock',value: products.outOfStock, color: 'var(--danger)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Admin. Here's what's happening.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <StatCard value={shops.total}      label="Total Shops"     icon="🏪" color="blue"   sub={`${shops.pending} pending approval`} />
        <StatCard value={shops.approved}   label="Active Shops"    icon="✅" color="green"  sub={`${shops.total - shops.approved} inactive`} />
        <StatCard value={users.total}      label="Total Users"     icon="👥" color="purple" sub={`${users.farmers} farmers · ${users.sellers} sellers`} />
        <StatCard value={products.total}   label="Products"        icon="📦" color="amber"  sub={`${products.outOfStock} out of stock`} />
        <StatCard value={orders.total}     label="Total Orders"    icon="🛒" color="blue"   sub={`${orders.pending} pending`} />
        <StatCard value={fmtMoney(orders.revenue)} label="Total Revenue" icon="💰" color="green" sub={`${fmtMoney(orders.monthlyRevenue)} this month`} />
      </div>

      {/* Charts Row */}
      <div className="overview-grid" style={{ marginBottom: 24 }}>
        <BarChart title="Shop Status Distribution" data={shopBarData} />
        <BarChart title="Product Inventory Health" data={productBarData} />
      </div>

      {/* Recent Activity */}
      <div className="overview-grid">
        <RecentList
          title="Recent Shops"
          emptyMsg="No shops registered yet"
          items={recentShops.map(s => ({
            icon: '🏪',
            title: s.name,
            sub: `Owner: ${s.ownerName || '—'} · ${fmtDate(s.created_at)}`,
            time: statusChips[s.status] || s.status,
          }))}
        />
        <RecentList
          title="Recent Users"
          emptyMsg="No users registered yet"
          items={recentUsers.map(u => ({
            icon: u.role === 'FARMER' ? '🌾' : u.role === 'ADMIN' ? '🔑' : '🏪',
            title: u.name,
            sub: u.email,
            time: statusChips[u.role] || u.role,
          }))}
        />
      </div>

      {recentOrders.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <RecentList
            title="Recent Orders"
            emptyMsg="No orders placed yet"
            items={recentOrders.map(o => ({
              icon: '📦',
              title: `#${o.orderId}`,
              sub: `${o.farmerName || 'Farmer'} → ${o.shopName || 'Shop'} · ${fmtMoney(o.totalAmount)}`,
              time: statusChips[o.status] || o.status,
            }))}
          />
        </div>
      )}
    </div>
  )
}

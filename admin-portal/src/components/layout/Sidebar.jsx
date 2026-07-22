// components/layout/Sidebar.jsx
import React from 'react'

const NAV = [
  { section: 'Main', items: [
    { id: 'overview',   icon: '📊', label: 'Overview' },
    { id: 'shops',      icon: '🏪', label: 'Shop Management', badge: 'pending' },
    { id: 'products',   icon: '📦', label: 'Product Catalog' },
    { id: 'orders',     icon: '🛒', label: 'Order Manager', badge: 'orders' },
  ]},
  { section: 'Admin', items: [
    { id: 'users',      icon: '👥', label: 'User Accounts' },
    { id: 'content',    icon: '🌾', label: 'Content Manager' },
    { id: 'analytics',  icon: '📈', label: 'Analytics' },
    { id: 'audit',      icon: '📋', label: 'Audit Logs' },
  ]},
  { section: 'System', items: [
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ]},
]

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, pendingShops, pendingOrders }) {
  const getBadge = (badge) => {
    if (badge === 'pending' && pendingShops > 0) return pendingShops
    if (badge === 'orders'  && pendingOrders > 0) return pendingOrders
    return null
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌱</div>
        <div className="sidebar-logo-text">
          <h2>AgriFarm</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <React.Fragment key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => {
              const badge = getBadge(item.badge)
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  data-testid={`nav-item-${item.id}`}
                  className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {badge !== null && <span className="nav-badge">{badge}</span>}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>
    </aside>
  )
}

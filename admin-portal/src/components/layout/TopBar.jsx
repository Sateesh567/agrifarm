// components/layout/TopBar.jsx
import React, { useState } from 'react'

const PAGE_TITLES = {
  overview:  { title: 'Dashboard Overview', icon: '📊' },
  shops:     { title: 'Shop Management', icon: '🏪' },
  products:  { title: 'Product Catalog', icon: '📦' },
  orders:    { title: 'Order Manager', icon: '🛒' },
  users:     { title: 'User Accounts', icon: '👥' },
  analytics: { title: 'Analytics & Reports', icon: '📈' },
  audit:     { title: 'Audit Logs', icon: '📋' },
  settings:  { title: 'Settings', icon: '⚙️' },
}

export default function TopBar({
  activeTab, collapsed, adminEmail,
  lastRefresh, isRefreshing, onRefresh,
  notifications, onNotif, onLogout, theme, onToggleTheme
}) {
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.overview
  const unread = notifications.length
  const initials = (adminEmail || 'A').charAt(0).toUpperCase()
  const refreshTime = lastRefresh
    ? lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className={`topbar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="topbar-page-title">
        <span style={{ marginRight: 8 }}>{page.icon}</span>
        {page.title}
      </div>

      <div className="topbar-actions">
        {refreshTime && (
          <span className="refresh-time">Updated {refreshTime}</span>
        )}

        <button
          className={`topbar-btn${isRefreshing ? ' spin' : ''}`}
          onClick={onRefresh}
          title="Refresh data"
        >
          🔄
        </button>

        <button className="topbar-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="topbar-divider" />

        <button className="topbar-btn" onClick={onNotif} title="Notifications">
          🔔
          {unread > 0 && <span className="topbar-notif-dot" />}
        </button>

        <div className="topbar-divider" />

        <div className="flex items-center gap-2">
          <div className="topbar-avatar" title={adminEmail}>{initials}</div>
          <div className="topbar-user-info" style={{ display: 'none' }}>
            <span className="topbar-user-name">{adminEmail}</span>
            <span className="topbar-user-role">Administrator</span>
          </div>
        </div>

        <button id="logout-btn" data-testid="logout-btn" className="btn btn-sm btn-secondary" onClick={onLogout} style={{ fontSize: 12 }}>
          Sign Out
        </button>
      </div>
    </header>
  )
}

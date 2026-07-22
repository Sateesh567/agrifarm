// pages/Analytics.jsx
import React, { useState, useEffect } from 'react'
import { api } from '../api/client.js'

function BarChart({ title, data, color = 'var(--primary)', labelWidth = 130 }) {
  if (!data || data.length === 0) return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="chart-empty">No data available yet</div>
    </div>
  )
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div className="bar-chart-group">
        {data.map((d, i) => (
          <div className="bar-row" key={i}>
            <div className="bar-label" style={{ width: labelWidth, minWidth: labelWidth }} title={d.label}>{d.label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`, background: d.color || color }}>
                {d.value > 0 && <span className="bar-val">{d.display !== undefined ? d.display : d.value}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  let offset = 0
  const cx = 70, cy = 70, r = 55, circumference = 2 * Math.PI * r

  const slices = data.map(d => {
    const pct = d.value / total
    const dash = pct * circumference
    const gap  = circumference - dash
    const slice = { ...d, pct, dash, gap, offset }
    offset += dash
    return slice
  })

  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      {total === 0
        ? <div className="chart-empty">No data available</div>
        : (
          <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
              {slices.map((s, i) => (
                <circle key={i} cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="20"
                  strokeDasharray={`${s.dash} ${s.gap}`}
                  strokeDashoffset={-s.offset + circumference * 0.25}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              ))}
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                fill="var(--text)" fontSize="18" fontWeight="700" fontFamily="var(--font-heading)">
                {total}
              </text>
              <text x={cx} y={cy + 16} textAnchor="middle" fill="var(--text3)" fontSize="10">Total</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {slices.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>({(s.pct * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

export default function Analytics({ dashboard }) {
  const [regReport, setRegReport]     = useState(null)
  const [revReport, setRevReport]     = useState(null)
  const [loadingReg, setLoadingReg]   = useState(true)
  const [loadingRev, setLoadingRev]   = useState(true)

  useEffect(() => {
    api.getRegistrationReport()
      .then(d => setRegReport(d))
      .catch(() => {})
      .finally(() => setLoadingReg(false))
    api.getRevenueReport()
      .then(d => setRevReport(d))
      .catch(() => {})
      .finally(() => setLoadingRev(false))
  }, [])

  const d = dashboard || {}
  const orders = d.orders || {}
  const users  = d.users  || {}

  // Revenue by shop bar data
  const shopRevData = (revReport?.revenueByShop || []).slice(0, 8).map(s => ({
    label:   s.shopName?.slice(0, 18) || '—',
    value:   Number(s.revenue || 0),
    display: `₹${Number(s.revenue || 0).toLocaleString('en-IN')}`,
    color:   'var(--primary)',
  }))

  // Order status donut
  const orderStatusData = (revReport?.orderStatusBreakdown || []).map(r => ({
    label: r.status, value: r.count,
    color: { PENDING: 'var(--warning)', DELIVERED: 'var(--primary)', CANCELLED: 'var(--danger)',
             CONFIRMED: 'var(--info)', PROCESSING: 'var(--info)', SHIPPED: 'hsl(265,70%,60%)' }[r.status] || 'var(--text3)'
  }))

  // User role donut
  const userRoleData = [
    { label: 'Farmers',    value: users.farmers || 0, color: 'var(--primary)' },
    { label: 'Sellers',    value: users.sellers || 0, color: 'var(--info)' },
    { label: 'Admins',     value: (users.total || 0) - (users.farmers || 0) - (users.sellers || 0), color: 'hsl(265,70%,60%)' },
  ]

  // Monthly registration trend
  const regMonths = {}
  ;(regReport?.userTrend || []).forEach(r => {
    if (!regMonths[r.month]) regMonths[r.month] = 0
    regMonths[r.month] += r.count
  })
  const regBarData = Object.entries(regMonths).sort().slice(-6).map(([month, count]) => ({
    label: month, value: count, color: 'var(--info)'
  }))

  // Monthly revenue trend
  const revBarData = (revReport?.monthlyRevenue || []).slice(-6).map(r => ({
    label: r.month,
    value: Number(r.revenue || 0),
    display: `₹${Number(r.revenue || 0).toLocaleString('en-IN')}`,
    color: 'var(--primary)',
  }))

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics & Reports</h1>
          <p>Insights into platform performance and growth trends</p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card green">
          <div className="stat-card-top">
            <div><div className="stat-card-value">₹{Number(orders.revenue || 0).toLocaleString('en-IN')}</div><div className="stat-card-label">Total Revenue</div></div>
            <div className="stat-card-icon">💰</div>
          </div>
          <div className="stat-card-sub">From delivered orders</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-card-top">
            <div><div className="stat-card-value">₹{Number(orders.monthlyRevenue || 0).toLocaleString('en-IN')}</div><div className="stat-card-label">Monthly Revenue</div></div>
            <div className="stat-card-icon">📅</div>
          </div>
          <div className="stat-card-sub">Last 30 days</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{orders.total || 0}</div><div className="stat-card-label">Total Orders</div></div>
            <div className="stat-card-icon">📦</div>
          </div>
          <div className="stat-card-sub">{orders.pending || 0} pending</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-top">
            <div><div className="stat-card-value">{users.total || 0}</div><div className="stat-card-label">Total Users</div></div>
            <div className="stat-card-icon">👥</div>
          </div>
          <div className="stat-card-sub">{users.blocked || 0} blocked</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="overview-grid" style={{ marginBottom: 24 }}>
        {loadingRev
          ? <div className="chart-container"><div className="skeleton" style={{ height: 120 }} /></div>
          : <BarChart title="Revenue by Month (Last 6 months)" data={revBarData} labelWidth={80} />}

        {loadingReg
          ? <div className="chart-container"><div className="skeleton" style={{ height: 120 }} /></div>
          : <BarChart title="User Registrations by Month (Last 6 months)" data={regBarData} color="var(--info)" labelWidth={80} />}
      </div>

      <div className="overview-grid" style={{ marginBottom: 24 }}>
        <DonutChart title="Order Status Breakdown" data={orderStatusData} />
        <DonutChart title="User Role Distribution" data={userRoleData} />
      </div>

      <div>
        {loadingRev
          ? <div className="chart-container"><div className="skeleton" style={{ height: 160 }} /></div>
          : <BarChart title="Top Shops by Revenue" data={shopRevData} />}
      </div>
    </div>
  )
}

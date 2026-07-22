// pages/OrderManager.jsx
import React, { useState, useMemo } from 'react'
import { api, exportCSV } from '../api/client.js'

const STATUSES = ['All', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_BADGE = {
  PENDING:    'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-blue',
  SHIPPED:    'badge-purple', DELIVERED: 'badge-green', CANCELLED: 'badge-red',
  RETURN_REQUESTED: 'badge-yellow', REFUNDED: 'badge-gray'
}
const VALID_NEXT = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['REFUNDED', 'DELIVERED'],
}
const PAGE_SIZE = 15

function OrderDetailModal({ order, onClose, onRefresh, showToast }) {
  const [updating, setUpdating] = useState(false)
  const next = VALID_NEXT[order.status] || []
  const fmtMoney = v => `₹${Number(v||0).toLocaleString('en-IN')}`
  const fmtDate  = v => v ? new Date(v).toLocaleString('en-IN') : '—'

  const changeStatus = async (status) => {
    setUpdating(true)
    try {
      await api.updateOrderStatus(order.orderId, status)
      showToast(`Order status → ${status}`, 'success')
      onRefresh(); onClose()
    } catch(e) { showToast(e.message, 'error') }
    setUpdating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Order #{order.orderId}</h2>
            <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div className="shop-detail-section" style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <h4 style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>ORDER DETAILS</h4>
              <div className="shop-detail-row"><span className="shop-detail-row-label">Order ID</span><span className="shop-detail-row-val">#{order.orderId}</span></div>
              <div className="shop-detail-row"><span className="shop-detail-row-label">Placed On</span><span className="shop-detail-row-val">{fmtDate(order.created_at)}</span></div>
              <div className="shop-detail-row"><span className="shop-detail-row-label">Total Amount</span><span className="shop-detail-row-val" style={{ color: 'var(--primary)', fontWeight: 700 }}>{fmtMoney(order.totalAmount)}</span></div>
              <div className="shop-detail-row"><span className="shop-detail-row-label">Delivery To</span><span className="shop-detail-row-val">{order.deliveryAddress || '—'}</span></div>
              {order.notes && <div className="shop-detail-row"><span className="shop-detail-row-label">Notes</span><span className="shop-detail-row-val">{order.notes}</span></div>}
            </div>
          </div>

          {order.items?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Items Ordered</h4>
              <table className="data-table" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="td-name">{item.productName || item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{fmtMoney(item.price)}</td>
                      <td>{fmtMoney(item.lineTotal || item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {next.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Update Status</h4>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {next.map(s => (
                  <button key={s} className={`btn btn-sm ${s === 'CANCELLED' ? 'btn-danger' : s === 'DELIVERED' ? 'btn-primary' : 'btn-info'}`}
                    disabled={updating} onClick={() => changeStatus(s)}>
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function OrderManager({ orders: allOrders, onRefresh, showToast, loading }) {
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('All')
  const [sortBy, setSortBy]     = useState('created_at')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let r = [...allOrders]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(o => o.orderId?.toLowerCase().includes(q) || o.farmerUid?.toLowerCase().includes(q) || o.shopId?.toLowerCase().includes(q) || o.deliveryAddress?.toLowerCase().includes(q))
    }
    if (status !== 'All') r = r.filter(o => o.status === status)
    r.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortDir === 'asc' ? 1 : -1)
    })
    return r
  }, [allOrders, search, status, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const toggleSort = col => { if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(col); setSortDir('asc') } }
  const sortArrow  = col => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const fmtMoney = v => `₹${Number(v||0).toLocaleString('en-IN')}`
  const fmtDate  = v => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const totalRevenue = filtered.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + Number(o.totalAmount || 0), 0)

  const handleExport = () => {
    exportCSV(filtered, 'agrifarm_orders.csv', [
      { label: 'Order ID',   key: r => r.orderId },
      { label: 'Status',     key: r => r.status },
      { label: 'Amount',     key: r => r.totalAmount },
      { label: 'Delivery',   key: r => (r.deliveryAddress || '').replace(/,/g, ';') },
      { label: 'Date',       key: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : '' },
    ])
    showToast('CSV exported', 'success')
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Order Manager</h1>
          <p>{allOrders.length} total orders · {allOrders.filter(o => o.status === 'PENDING').length} pending · {fmtMoney(allOrders.filter(o => o.status === 'DELIVERED').reduce((a, o) => a + Number(o.totalAmount || 0), 0))} delivered revenue</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>⬇ Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={onRefresh} disabled={loading}>🔄 Refresh</button>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>Orders ({filtered.length}){status === 'DELIVERED' ? ` · Revenue: ${fmtMoney(totalRevenue)}` : ''}</h3>
          <div className="data-card-filters">
            <div className="search-input">
              <span className="search-input-icon">🔍</span>
              <input placeholder="Search order ID, address…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
          : paginated.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">🛒</div><h3>No orders found</h3></div>
          : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('orderId')}>Order ID{sortArrow('orderId')}</th>
                  <th>Items</th>
                  <th onClick={() => toggleSort('totalAmount')}>Amount{sortArrow('totalAmount')}</th>
                  <th onClick={() => toggleSort('status')}>Status{sortArrow('status')}</th>
                  <th>Delivery Address</th>
                  <th onClick={() => toggleSort('created_at')}>Date{sortArrow('created_at')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(o => (
                  <tr key={o.orderId}>
                    <td><div className="td-name">#{o.orderId}</div></td>
                    <td>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{fmtMoney(o.totalAmount)}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    <td className="text-muted" style={{ maxWidth: 200 }}><span className="truncate">{o.deliveryAddress || '—'}</span></td>
                    <td className="text-muted">{fmtDate(o.created_at)}</td>
                    <td>
                      <button className="btn btn-info btn-xs" onClick={() => setSelected(o)}>👁 View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page===1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page===1}>‹</button>
            {Array.from({ length: Math.min(totalPages,5) }, (_, i) => {
              const n = Math.max(1, Math.min(page-2, totalPages-4)) + i
              return n <= totalPages && <button key={n} className={`page-btn${page===n?' active':''}`} onClick={() => setPage(n)}>{n}</button>
            })}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
          </div>
        </div>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onRefresh={onRefresh}
          showToast={showToast}
        />
      )}
    </div>
  )
}

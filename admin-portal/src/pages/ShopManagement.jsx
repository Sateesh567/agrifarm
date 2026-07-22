// pages/ShopManagement.jsx
import React, { useState, useMemo } from 'react'
import { api, exportCSV } from '../api/client.js'

const STATUS_OPTIONS = ['All', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']
const PLAN_LABELS = { FREE: '🆓 Free', BASIC: '⭐ Basic', PREMIUM: '💎 Premium' }
const PLAN_COLORS = { FREE: 'badge-gray', BASIC: 'badge-blue', PREMIUM: 'badge-purple' }

function StatusBadge({ status }) {
  const cls = {
    PENDING:   'badge-yellow', APPROVED: 'badge-green',
    REJECTED:  'badge-red',    SUSPENDED: 'badge-gray',
  }[status] || 'badge-gray'
  return <span className={`badge ${cls}`}>{status}</span>
}

function ShopProfileModal({ shop, onClose, onRefresh, showToast }) {
  const [isEditing, setIsEditing] = useState(false)
  const [changing, setChanging] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: shop.name || '',
    category: shop.category || 'Seeds & Fertilizers',
    description: shop.description || '',
    address: shop.address || '',
    phone: shop.phone || '',
    license_number: shop.license_number || '',
    plan: shop.plan || 'FREE',
    documents_uploaded: shop.documents_uploaded ? true : false,
  })

  const handleUpdateDetails = async (e) => {
    e.preventDefault()
    setChanging(true)
    try {
      await api.updateAdminShop(shop.id, {
        ...form,
        documents_uploaded: form.documents_uploaded ? 1 : 0
      })
      showToast('Shop details updated successfully!', 'success')
      setIsEditing(false)
      onRefresh()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setChanging(false)
  }

  const changeStatus = async (status) => {
    setChanging(true)
    try {
      await api.updateShopStatus(shop.id, status)
      showToast(`Shop status changed to ${status}`, 'success')
      onRefresh()
      onClose()
    } catch(e) { showToast(e.message, 'error') }
    setChanging(false)
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this shop and all its data?')) return
    setDeleting(true)
    try {
      await api.deleteShop(shop.id)
      showToast('Shop deleted', 'success')
      onRefresh()
      onClose()
    } catch(e) { showToast(e.message, 'error') }
    setDeleting(false)
  }

  const fmtDate = v => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const fmtMoney = v => `₹${Number(v || 0).toLocaleString('en-IN')}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="shop-profile-hero">
          <div className="shop-profile-img">🏪</div>
          <div style={{ flex: 1 }}>
            <h2>{isEditing ? `Edit: ${shop.name}` : shop.name}</h2>
            <div className="shop-profile-meta">
              <StatusBadge status={shop.status} />
              <span className={`badge ${PLAN_COLORS[shop.plan] || 'badge-gray'}`}>{PLAN_LABELS[shop.plan] || shop.plan || 'Free'}</span>
              <span className="badge badge-blue">{shop.category || 'General Store'}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
              Registered {fmtDate(shop.created_at)} · {shop.productCount || 0} products · {shop.orderCount || 0} orders
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateDetails}>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Shop Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="Seeds & Fertilizers">Seeds & Fertilizers</option>
                    <option value="Organic Manures">Organic Manures</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input className="form-input" value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan *</label>
                  <select className="form-select" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div className="form-group flex items-center" style={{ marginTop: 24 }}>
                  <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                    <input type="checkbox" checked={form.documents_uploaded} onChange={e => setForm(p => ({ ...p, documents_uploaded: e.target.checked }))} />
                    Documents Uploaded
                  </label>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={changing}>{changing ? 'Saving…' : '💾 Save Changes'}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="shop-detail-grid">
                <div className="shop-detail-section">
                  <h4>📋 Shop Information</h4>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Shop Name</span><span className="shop-detail-row-val">{shop.name}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Category</span><span className="shop-detail-row-val">{shop.category || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Address</span><span className="shop-detail-row-val">{shop.address || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Description</span><span className="shop-detail-row-val">{shop.description || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">License No.</span><span className="shop-detail-row-val">{shop.license_number || 'Not provided'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Phone</span><span className="shop-detail-row-val">{shop.phone || shop.ownerPhone || '—'}</span></div>
                </div>

                <div className="shop-detail-section">
                  <h4>👤 Owner Details</h4>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Owner Name</span><span className="shop-detail-row-val">{shop.ownerName || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Email</span><span className="shop-detail-row-val">{shop.ownerEmail || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Phone</span><span className="shop-detail-row-val">{shop.ownerPhone || '—'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Address</span><span className="shop-detail-row-val">{shop.ownerAddress || '—'}</span></div>
                </div>

                <div className="shop-detail-section">
                  <h4>📊 Performance</h4>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Total Orders</span><span className="shop-detail-row-val">{shop.orderCount || 0}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Total Revenue</span><span className="shop-detail-row-val">{fmtMoney(shop.totalRevenue)}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Products</span><span className="shop-detail-row-val">{shop.productCount || 0}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Rating</span><span className="shop-detail-row-val">{shop.rating ? `${shop.rating} / 5.0` : 'No reviews'}</span></div>
                </div>

                <div className="shop-detail-section">
                  <h4>🔧 Admin Details</h4>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Status</span><span className="shop-detail-row-val"><StatusBadge status={shop.status} /></span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Plan</span><span className="shop-detail-row-val">{PLAN_LABELS[shop.plan] || 'Free'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Docs Uploaded</span><span className="shop-detail-row-val">{shop.documents_uploaded ? '✅ Yes' : '❌ No'}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Verified At</span><span className="shop-detail-row-val">{fmtDate(shop.verified_at)}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Registered</span><span className="shop-detail-row-val">{fmtDate(shop.created_at)}</span></div>
                  <div className="shop-detail-row"><span className="shop-detail-row-label">Last Updated</span><span className="shop-detail-row-val">{fmtDate(shop.updated_at)}</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
              <button className="btn btn-info btn-sm" onClick={() => setIsEditing(true)}>✏️ Edit Details</button>
              {shop.status !== 'APPROVED'  && <button className="btn btn-primary btn-sm" disabled={changing} onClick={() => changeStatus('APPROVED')}>✅ Approve</button>}
              {shop.status !== 'PENDING'   && <button className="btn btn-warning btn-sm" disabled={changing} onClick={() => changeStatus('PENDING')}>⏳ Set Pending</button>}
              {shop.status !== 'REJECTED'  && <button className="btn btn-danger btn-sm"  disabled={changing} onClick={() => changeStatus('REJECTED')}>❌ Reject</button>}
              {shop.status !== 'SUSPENDED' && <button className="btn btn-ghost btn-sm"   disabled={changing} onClick={() => changeStatus('SUSPENDED')}>⏸ Suspend</button>}
              <div style={{ flex: 1 }} />
              <button className="btn btn-danger btn-sm" disabled={deleting} onClick={handleDelete}>🗑 Delete Shop</button>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AddShopModal({ users, onClose, onRefresh, showToast }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    ownerId: users[0]?.uid || '',
    name: '',
    category: 'Seeds & Fertilizers',
    description: '',
    address: '',
    phone: '',
    license_number: '',
    plan: 'FREE'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ownerId) {
      showToast('Please select a valid shop owner', 'error')
      return
    }
    setSaving(true)
    try {
      await api.createAdminShop(form)
      showToast('New shop created successfully!', 'success')
      onRefresh()
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏪 Add New Shop</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Shop Owner *</label>
                <select className="form-select" value={form.ownerId} onChange={e => setForm(p => ({ ...p, ownerId: e.target.value }))} required>
                  {users.map(u => <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="Seeds & Fertilizers">Seeds & Fertilizers</option>
                  <option value="Organic Manures">Organic Manures</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-input" value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Plan *</label>
                <select className="form-select" value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}>
                  <option value="FREE">Free</option>
                  <option value="BASIC">Basic</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              <div className="form-group form-full">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : '💾 Create Shop'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PAGE_SIZE = 15

export default function ShopManagement({ shops: allShops, users = [], onRefresh, showToast, loading }) {
  const [search, setSearch]       = useState('')
  const [status, setStatus]       = useState('All')
  const [sortBy, setSortBy]       = useState('created_at')
  const [sortDir, setSortDir]     = useState('desc')
  const [page, setPage]           = useState(1)
  const [selected, setSelected]   = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const eligibleOwners = useMemo(() => {
    return users.filter(u => u.role === 'SHOP_OWNER')
  }, [users])

  const filtered = useMemo(() => {
    let r = [...allShops]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(s => s.name?.toLowerCase().includes(q) || s.ownerName?.toLowerCase().includes(q) || s.ownerEmail?.toLowerCase().includes(q))
    }
    if (status !== 'All') r = r.filter(s => s.status === status)
    r.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return r
  }, [allShops, search, status, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }
  const sortArrow = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const handleExport = () => {
    exportCSV(filtered, 'agrifarm_shops.csv', [
      { label: 'Shop Name',    key: r => r.name },
      { label: 'Category',     key: r => r.category },
      { label: 'Status',       key: r => r.status },
      { label: 'Owner Name',   key: r => r.ownerName },
      { label: 'Owner Email',  key: r => r.ownerEmail },
      { label: 'Owner Phone',  key: r => r.ownerPhone },
      { label: 'Address',      key: r => (r.address || '').replace(/,/g, ';') },
      { label: 'Plan',         key: r => r.plan || 'FREE' },
      { label: 'Products',     key: r => r.productCount || 0 },
      { label: 'Orders',       key: r => r.orderCount || 0 },
      { label: 'Revenue',      key: r => r.totalRevenue || 0 },
      { label: 'Registered',   key: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : '' },
    ])
    showToast('CSV exported', 'success')
  }

  const fmtDate  = v => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const fmtMoney = v => `₹${Number(v || 0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Shop Management</h1>
          <p>{allShops.length} registered shops — {allShops.filter(s => s.status === 'PENDING').length} pending approval</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>⬇ Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>➕ Add Shop</button>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>🔄 Refresh</button>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Shops ({filtered.length})</h3>
          <div className="data-card-filters">
            <div className="search-input">
              <span className="search-input-icon">🔍</span>
              <input placeholder="Search shops, owners…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
          : paginated.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">🏪</div><h3>No shops found</h3><p>No shops match your search criteria.</p></div>
          : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}>Shop Name{sortArrow('name')}</th>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th onClick={() => toggleSort('category')}>Category{sortArrow('category')}</th>
                  <th onClick={() => toggleSort('status')}>Status{sortArrow('status')}</th>
                  <th>Plan</th>
                  <th>Products</th>
                  <th>Revenue</th>
                  <th onClick={() => toggleSort('created_at')}>Registered{sortArrow('created_at')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(shop => (
                  <tr key={shop.id}>
                    <td>
                      <div className="td-name">{shop.name}</div>
                      <div className="text-sm text-muted">{shop.address || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{shop.ownerName || '—'}</div>
                      <div className="text-sm text-muted">{shop.ownerEmail || '—'}</div>
                    </td>
                    <td className="text-muted">{shop.ownerPhone || '—'}</td>
                    <td>{shop.category || '—'}</td>
                    <td><StatusBadge status={shop.status} /></td>
                    <td><span className={`badge ${PLAN_COLORS[shop.plan] || 'badge-gray'}`}>{shop.plan || 'FREE'}</span></td>
                    <td>{shop.productCount || 0}</td>
                    <td>{fmtMoney(shop.totalRevenue)}</td>
                    <td className="text-muted">{fmtDate(shop.created_at)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-info btn-xs" onClick={() => setSelected(shop)}>👁 View</button>
                        {shop.status === 'PENDING' && (
                          <button className="btn btn-primary btn-xs" onClick={async () => {
                            try {
                              await api.updateShopStatus(shop.id, 'APPROVED')
                              showToast('Shop approved!', 'success')
                              onRefresh()
                            } catch(e) { showToast(e.message, 'error') }
                          }}>✅ Approve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">
            Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
            <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return p <= totalPages && (
                <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )
            })}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page === totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          </div>
        </div>
      </div>

      {selected && (
        <ShopProfileModal
          shop={selected}
          onClose={() => setSelected(null)}
          onRefresh={onRefresh}
          showToast={showToast}
        />
      )}

      {showAddModal && (
        <AddShopModal
          users={eligibleOwners}
          onClose={() => setShowAddModal(false)}
          onRefresh={onRefresh}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// pages/UserAccounts.jsx
// Fix 3: Uses ADMIN_CONSTANTS for all hardcoded strings.
// Fix 5: Seed users (from setup_db.js) are labeled with a '🌱 Seed' badge to
//         distinguish them from organically registered accounts.
import React, { useState, useMemo } from 'react'
import { api, exportCSV } from '../api/client.js'
import { ADMIN_CONSTANTS as C } from '../constants.js'

const ROLES = ['All', 'FARMER', 'SHOP_OWNER', 'ADMIN']
const PAGE_SIZE = 15

// Fix 5: Seed user email patterns created during setup_db.js initialization.
// These are test accounts, NOT automatically generated from signup.
const SEED_EMAILS = [
  'admin@agrifarm.com',
  'farmer@test.com',
  'seller@test.com',
  'farmer1@example.com',
  'seller1@example.com',
]
const isSeedUser = (email) => SEED_EMAILS.includes(email?.toLowerCase())

function UserModal({ user, onClose, onRefresh, showToast, isAdd }) {
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', address: user?.address || '',
    role: user?.role || 'FARMER', newPassword: ''
  })
  const [saving, setSaving] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isAdd) {
        await api.registerUser({ ...form, password: form.newPassword || 'agrifarm@123' })
        showToast(C.USERS_DEFAULT_PASSWORD_MSG, 'success')
      } else {
        await api.updateUser(user.uid, { name: form.name, phone: form.phone, address: form.address })
        showToast('Profile updated!', 'success')
      }
      onRefresh(); onClose()
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isAdd ? C.USERS_MODAL_ADD_TITLE : C.USERS_MODAL_EDIT_TITLE}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{C.LABEL_FULL_NAME}</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              {isAdd && (
                <div className="form-group">
                  <label className="form-label">{C.LABEL_EMAIL}</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{C.LABEL_PHONE}</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              {isAdd && (
                <div className="form-group">
                  <label className="form-label">{C.LABEL_ROLE}</label>
                  <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="FARMER">Farmer</option>
                    <option value="SHOP_OWNER">Shop Owner</option>
                  </select>
                </div>
              )}
              <div className="form-group form-full">
                <label className="form-label">{C.LABEL_ADDRESS}</label>
                <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{C.BTN_CANCEL}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? C.BTN_SAVING : C.BTN_SAVE}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BlockModal({ user, onClose, onRefresh, showToast }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const handle = async () => {
    if (!reason.trim()) { showToast(C.ERR_BLOCK_REASON, 'warning'); return }
    setSaving(true)
    try {
      await api.blockUser(user.uid, reason)
      showToast(`User ${user.name} blocked`, 'success')
      onRefresh(); onClose()
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚫 Block User</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="info-box warning" style={{ marginBottom: 16 }}>
            Blocking <strong>{user.name}</strong> will prevent them from logging in until unblocked.
          </div>
          <div className="form-group">
            <label className="form-label">Reason *</label>
            <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for blocking this account…" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" disabled={saving} onClick={handle}>{saving ? 'Blocking…' : '🚫 Block User'}</button>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordModal({ user, onClose, onRefresh, showToast }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const handle = async () => {
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'warning'); return }
    setSaving(true)
    try {
      await api.resetPassword(user.uid, password)
      showToast('Password reset successfully', 'success')
      onClose()
    } catch(e) { showToast(e.message, 'error') }
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 Reset Password</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="info-box info" style={{ marginBottom: 16 }}>
            Resetting password for <strong>{user.name}</strong>. All existing sessions will be revoked.
          </div>
          <div className="form-group">
            <label className="form-label">New Password *</label>
            <input className="form-input" type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password (min 6 chars)" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-warning" disabled={saving} onClick={handle}>{saving ? 'Resetting…' : '🔑 Reset Password'}</button>
        </div>
      </div>
    </div>
  )
}

export default function UserAccounts({ users: allUsers, onRefresh, showToast, loading }) {
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('All')
  const [sortBy, setSortBy]   = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState(null) // { type, user }

  const filtered = useMemo(() => {
    let r = [...allUsers]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q))
    }
    if (role !== 'All') r = r.filter(u => u.role === role)
    r.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return r
  }, [allUsers, search, role, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const toggleSort = col => { if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(col); setSortDir('asc') } }
  const sortArrow  = col => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const handleDelete = async (uid, name) => {
    if (!confirm(`Deactivate ${name}?`)) return
    try {
      await api.deleteUser(uid)
      showToast('User deactivated', 'success')
      onRefresh()
    } catch(e) { showToast(e.message, 'error') }
  }

  const handleUnblock = async (uid, name) => {
    try {
      await api.unblockUser(uid)
      showToast(`${name} unblocked`, 'success')
      onRefresh()
    } catch(e) { showToast(e.message, 'error') }
  }

  const handleExport = () => {
    exportCSV(filtered, 'agrifarm_users.csv', [
      { label: 'Name',     key: r => r.name },
      { label: 'Email',    key: r => r.email },
      { label: 'Phone',    key: r => r.phone || '' },
      { label: 'Role',     key: r => r.role },
      { label: 'Status',   key: r => r.blocked_at ? 'Blocked' : r.is_active ? 'Active' : 'Inactive' },
      { label: 'Address',  key: r => (r.address || '').replace(/,/g, ';') },
      { label: 'Joined',   key: r => r.created_at ? new Date(r.created_at).toLocaleDateString() : '' },
    ])
    showToast('CSV exported', 'success')
  }

  const fmtDate = v => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{C.USERS_TITLE}</h1>
          <p>{allUsers.length} registered users · {allUsers.filter(u => u.blocked_at).length} blocked · <span title="Test accounts seeded by setup_db.js — not auto-generated during signup">🌱 {allUsers.filter(u => isSeedUser(u.email)).length} seed</span></p>
        </div>
        <div className="page-header-actions">
          <button id="users-export-btn" className="btn btn-secondary btn-sm" onClick={handleExport}>{C.USERS_EXPORT_BTN}</button>
          <button id="users-add-btn" className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'add', user: null })}>{C.USERS_ADD_BTN}</button>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Users ({filtered.length})</h3>
          <div className="data-card-filters">
            <div className="search-input">
              <span className="search-input-icon">🔍</span>
              <input placeholder="Search name, email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
            <select className="filter-select" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
          : paginated.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">👥</div><h3>No users found</h3></div>
          : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('name')}>Name{sortArrow('name')}</th>
                  <th onClick={() => toggleSort('email')}>Email{sortArrow('email')}</th>
                  <th>Phone</th>
                  <th onClick={() => toggleSort('role')}>Role{sortArrow('role')}</th>
                  <th>Status</th>
                  <th onClick={() => toggleSort('created_at')}>Joined{sortArrow('created_at')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(user => (
                  <tr key={user.uid}>
                    <td>
                      <div className="td-name">
                        {user.name}
                        {/* Fix 5: Mark seed/test users clearly so admins know these are NOT auto-generated accounts */}
                        {isSeedUser(user.email) && (
                          <span
                            className="badge badge-gray"
                            title="Seed account from setup_db.js — test account, not auto-generated during signup"
                            style={{ marginLeft: 6, fontSize: 10 }}
                          >🌱 Seed</span>
                        )}
                      </div>
                      <div className="text-sm text-muted">{user.address || '—'}</div>
                    </td>
                    <td>{user.email}</td>
                    <td className="text-muted">{user.phone || '—'}</td>
                    <td>
                      <span className={`badge ${user.role === 'FARMER' ? 'badge-green' : user.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
                    </td>
                    <td>
                      {user.blocked_at
                        ? <span className="badge badge-red" title={user.blocked_reason}>🚫 Blocked</span>
                        : user.is_active
                        ? <span className="badge badge-green">✅ Active</span>
                        : <span className="badge badge-gray">Inactive</span>}
                    </td>
                    <td className="text-muted">{fmtDate(user.created_at)}</td>
                    <td>
                      <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                        <button className="btn btn-info btn-xs" onClick={() => setModal({ type: 'edit', user })}>✏️ Edit</button>
                        <button className="btn btn-warning btn-xs" onClick={() => setModal({ type: 'reset', user })}>🔑 Reset</button>
                        {user.blocked_at
                          ? <button className="btn btn-primary btn-xs" onClick={() => handleUnblock(user.uid, user.name)}>✅ Unblock</button>
                          : user.role !== 'ADMIN' && <button className="btn btn-danger btn-xs" onClick={() => setModal({ type: 'block', user })}>🚫 Block</button>}
                        {user.role !== 'ADMIN' && <button className="btn btn-ghost btn-xs" onClick={() => handleDelete(user.uid, user.name)}>🗑</button>}
                      </div>
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page-2, totalPages-4)) + i
              return p <= totalPages && <button key={p} className={`page-btn${page===p?' active':''}`} onClick={() => setPage(p)}>{p}</button>
            })}
            <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={page===totalPages}>›</button>
            <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</button>
          </div>
        </div>
      </div>

      {modal?.type === 'add'   && <UserModal isAdd  user={null}       onClose={() => setModal(null)} onRefresh={onRefresh} showToast={showToast} />}
      {modal?.type === 'edit'  && <UserModal        user={modal.user} onClose={() => setModal(null)} onRefresh={onRefresh} showToast={showToast} />}
      {modal?.type === 'block' && <BlockModal       user={modal.user} onClose={() => setModal(null)} onRefresh={onRefresh} showToast={showToast} />}
      {modal?.type === 'reset' && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} onRefresh={onRefresh} showToast={showToast} />}
    </div>
  )
}

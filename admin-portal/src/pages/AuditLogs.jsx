// pages/AuditLogs.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { api } from '../api/client.js'

const ACTION_COLORS = {
  LOGIN: 'login', REGISTER: 'register', DELETE_USER: 'delete',
  BLOCK_USER: 'block', UNBLOCK_USER: 'approve', UPDATE_SHOP_STATUS: 'update',
  UPDATE_ORDER_STATUS: 'update', DELETE_SHOP: 'delete', RESET_PASSWORD: 'update',
  UPDATE_PROFILE: 'update',
}

const PAGE_SIZE = 20

export default function AuditLogs() {
  const [logs, setLogs]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [action, setAction]   = useState('All')

  const ACTIONS = ['All', 'LOGIN', 'REGISTER', 'DELETE_USER', 'BLOCK_USER', 'UNBLOCK_USER',
    'UPDATE_SHOP_STATUS', 'UPDATE_ORDER_STATUS', 'RESET_PASSWORD', 'DELETE_SHOP']

  const fetchLogs = async (p = page, act = action) => {
    setLoading(true)
    try {
      const params = { page: p, limit: PAGE_SIZE }
      if (act !== 'All') params.action = act
      const data = await api.getAuditLogs(params)
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch(e) {}
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = useMemo(() => {
    if (!search) return logs
    const q = search.toLowerCase()
    return logs.filter(l => l.action?.toLowerCase().includes(q) || l.userName?.toLowerCase().includes(q) || l.entity_type?.toLowerCase().includes(q))
  }, [logs, search])

  const handleAction = (act) => { setAction(act); setPage(1); fetchLogs(1, act) }
  const handlePage   = (p)   => { setPage(p); fetchLogs(p) }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const fmtDate = v => v ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <p>Admin action history and security events</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => fetchLogs(page)}>🔄 Refresh</button>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>Audit Trail ({total} events)</h3>
          <div className="data-card-filters">
            <div className="search-input">
              <span className="search-input-icon">🔍</span>
              <input placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={action} onChange={e => handleAction(e.target.value)}>
              {ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loading-spinner" /></div>
          : filtered.length === 0
          ? <div className="table-empty"><div className="table-empty-icon">📋</div><h3>No audit logs found</h3><p>Admin actions will appear here</p></div>
          : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={`audit-action-chip ${ACTION_COLORS[log.action] || ''}`}>{log.action}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.userName || 'System'}</div>
                      <div className="text-sm text-muted">{log.user_id?.slice(0, 12) || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{log.entity_type}</div>
                      <div className="text-sm text-muted">{log.entity_id?.slice(0, 14) || '—'}</div>
                    </td>
                    <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ip_address || '—'}</td>
                    <td>
                      {log.new_values && (
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)' }}>
                          {typeof log.new_values === 'string' ? log.new_values.slice(0, 40) : JSON.stringify(log.new_values).slice(0, 40)}
                        </span>
                      )}
                    </td>
                    <td className="text-muted">{fmtDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">Page {page} of {totalPages} · {total} total events</span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => handlePage(1)} disabled={page===1}>«</button>
            <button className="page-btn" onClick={() => handlePage(page-1)} disabled={page===1}>‹</button>
            {Array.from({ length: Math.min(totalPages,5) }, (_, i) => {
              const n = Math.max(1, Math.min(page-2, totalPages-4)) + i
              return n <= totalPages && <button key={n} className={`page-btn${page===n?' active':''}`} onClick={() => handlePage(n)}>{n}</button>
            })}
            <button className="page-btn" onClick={() => handlePage(page+1)} disabled={page===totalPages}>›</button>
            <button className="page-btn" onClick={() => handlePage(totalPages)} disabled={page===totalPages}>»</button>
          </div>
        </div>
      </div>
    </div>
  )
}

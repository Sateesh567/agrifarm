import React, { useState } from 'react'
import { api } from '../../api/client.js'

export default function FarmerSettings({
  user,
  setView,
  theme,
  onToggleTheme,
  onProfileUpdate
}) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [address, setAddress] = useState(user.address || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload = { name, phone, address }
      if (password) {
        payload.password = password
      }
      
      const updatedUser = await api.updateUserProfileMe(payload)
      
      // Update local state in parent
      sessionStorage.setItem('agrifarm_user', JSON.stringify({
        ...JSON.parse(sessionStorage.getItem('agrifarm_user') || '{}'),
        ...updatedUser
      }))
      onProfileUpdate(updatedUser)
      
      setSuccess('Profile updated successfully!')
      setPassword('')
    } catch (err) {
      setError(err.message || 'Profile update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="farmer-settings-container">
      <style>{`
        .farmer-settings-container {
          padding: 24px;
          max-width: 600px;
          margin: 0 auto;
          color: var(--text);
        }
        .settings-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          margin-top: 16px;
        }
        .form-row {
          margin-bottom: 16px;
        }
        .theme-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px 18px;
          margin-bottom: 24px;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>⚙️ Profile & Settings</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('home')}>⬅️ Back to Shop</button>
      </div>

      <div className="theme-toggle-row">
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Visual Theme Choice</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '2px' }}>
            Switch between Dark Mode and Light Mode layouts.
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️ Light Theme' : '🌙 Dark Theme'}
        </button>
      </div>

      <div className="settings-card">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
          Personal Bio Details
        </h3>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-row">
            <label className="login-label">Full Name</label>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label className="login-label">Registered Email Address (Locked)</label>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }}
              type="email"
              value={user.email}
              disabled
            />
          </div>

          <div className="form-row">
            <label className="login-label">Phone Number</label>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label className="login-label">Delivery Address</label>
            <textarea
              className="login-input"
              style={{ height: '80px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: '24px 0 20px 0' }}>
            Modify Security Access
          </h3>

          <div className="form-row">
            <label className="login-label">New Password (Leave blank to keep current)</label>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-20" disabled={loading}>
            {loading ? '⏳ Updating Profile...' : '💾 Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { api } from '../../api/client.js'

export default function SellerSettings({
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
  
  // Shop fields
  const [shop, setShop] = useState(null)
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [shopCategory, setShopCategory] = useState('General Store')
  const [imageUrl, setImageUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  React.useEffect(() => {
    loadShopData()
  }, [])

  const loadShopData = async () => {
    try {
      const allShops = await api.getShops()
      const myShop = allShops.find(s => s.ownerId === user.uid)
      if (myShop) {
        setShop(myShop)
        setShopName(myShop.name || '')
        setShopAddress(myShop.address || '')
        setShopDescription(myShop.description || '')
        setShopCategory(myShop.category || 'General Store')
        setImageUrl(myShop.imageUrl || '')
      }
    } catch(err) {
      console.error(err)
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // 1. Update personal credentials
      const userPayload = { name, phone, address }
      if (password) userPayload.password = password
      const updatedUser = await api.updateUserProfileMe(userPayload)

      // 2. Update shop profile details
      if (shop) {
        const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
        const shopRes = await fetch(`${BASE}/api/shops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('agrifarm_token')}`
          },
          body: JSON.stringify({
            ownerId: user.uid,
            name: shopName,
            address: shopAddress,
            description: shopDescription,
            category: shopCategory,
            imageUrl: imageUrl
          })
        })
        const shopData = await shopRes.json().catch(() => ({}))
        if (!shopRes.ok) throw new Error(shopData.error || 'Failed to update shop profile details.')
      }

      // Update parent session details
      sessionStorage.setItem('agrifarm_user', JSON.stringify({
        ...JSON.parse(sessionStorage.getItem('agrifarm_user') || '{}'),
        ...updatedUser
      }))
      onProfileUpdate(updatedUser)

      setSuccess('Shop Merchant and Store Profile updated successfully!')
      setPassword('')
      loadShopData()
    } catch(err) {
      setError(err.message || 'Profile settings update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="seller-settings-container">
      <style>{`
        .seller-settings-container {
          padding: 24px;
          max-width: 700px;
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
        .section-separator {
          font-family: var(--font-heading);
          color: var(--primary);
          font-size: 1.15rem;
          margin: 28px 0 16px 0;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
      `}</style>

      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem' }}>⚙️ Shop & Owner Settings</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setView('dashboard')}>⬅️ Back to Dashboard</button>
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
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSettingsSubmit}>
          <div className="section-separator">Owner Bio Details</div>
          
          <div className="form-row">
            <label className="login-label">Owner Name</label>
            <input
              className="login-input"
              style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              <label className="login-label">Email Address (Locked)</label>
              <input
                className="login-input"
                style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)', opacity: 0.6 }}
                type="email"
                value={user.email}
                disabled
              />
            </div>
          </div>

          <div className="form-row">
            <label className="login-label">Contact Address</label>
            <textarea
              className="login-input"
              style={{ height: '70px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {shop && (
            <>
              <div className="section-separator">Store Profile Details</div>

              <div className="form-row">
                <label className="login-label">Shop Name</label>
                <input
                  className="login-input"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-row">
                  <label className="login-label">Shop Category</label>
                  <select
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value)}
                    required
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Tools">Tools</option>
                    <option value="General Store">General Store</option>
                  </select>
                </div>
                <div className="form-row">
                  <label className="login-label">Shop Image URL</label>
                  <input
                    className="login-input"
                    style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <label className="login-label">Shop Address</label>
                <textarea
                  className="login-input"
                  style={{ height: '70px', resize: 'none', border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="login-label">Shop Description</label>
                <input
                  className="login-input"
                  style={{ border: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 'var(--radius-xs)' }}
                  type="text"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="section-separator">Credentials & Security</div>

          <div className="form-row">
            <label className="login-label">Change Password (Leave blank to keep current)</label>
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

          <button type="submit" className="btn btn-primary w-full mt-24" disabled={loading}>
            {loading ? '⏳ Updating Configurations...' : '💾 Save Configurations'}
          </button>
        </form>
      </div>
    </div>
  )
}

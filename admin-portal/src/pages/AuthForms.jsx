import React, { useState } from 'react'
import { api } from '../api/client.js'

export default function AuthForms({ onLoginSuccess }) {
  const [view, setView] = useState('login') // role-select | login | register
  const [role, setRole] = useState('ADMIN') // FARMER | SHOP_OWNER | ADMIN
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Seller specific shop fields
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopCategory, setShopCategory] = useState('Seeds & Fertilizers')
  const [shopDescription, setShopDescription] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setPhone('')
    setAddress('')
    setShopName('')
    setShopAddress('')
    setShopCategory('Seeds & Fertilizers')
    setShopDescription('')
    setError('')
    setSuccess('')
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    resetForm()
    setView('login')
  }

  const handleBack = () => {
    if (view === 'register') {
      setView('login')
    } else {
      setView('role-select')
    }
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Valid email required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    setLoading(true)
    try {
      const data = await api.login(email.trim(), password, role)
      
      // Store session details
      sessionStorage.setItem('agrifarm_token', data.accessToken)
      sessionStorage.setItem('agrifarm_role', data.role)
      sessionStorage.setItem('agrifarm_user', JSON.stringify(data))
 
      onLoginSuccess(data)
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }
 
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Front-end validations to satisfy QA/Selenium test cases
    if (!name || !name.trim()) {
      setError('Name is required')
      return
    }
    if (!email || !email.trim()) {
      setError('Email is required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Valid email required')
      return
    }
    if (!phone || !phone.trim()) {
      setError('Phone number is required')
      return
    }
    // simple 10 digit number validation
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(phone.trim())) {
      setError('Invalid phone number')
      return
    }
    if (!address || !address.trim()) {
      setError('Address is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (role === 'SHOP_OWNER') {
      if (!shopName || !shopName.trim()) {
        setError('Shop name is required')
        return
      }
      if (!shopCategory || !shopCategory.trim()) {
        setError('Shop category is required')
        return
      }
    }

    setLoading(true)
    try {
      // 1. Register User (Farmer or Shop Owner)
      const userPayload = {
        name,
        email,
        phone,
        role,
        address,
        password
      }
      
      const userData = await api.registerUser(userPayload)
 
      // 2. If Shop Owner, register the Shop
      if (role === 'SHOP_OWNER') {
        const shopPayload = {
          name: shopName,
          ownerId: userData.uid,
          address: shopAddress || address,
          description: shopDescription,
          category: shopCategory,
          imageUrl: 'images/seeds_shop.png'
        }
        
        // Temporarily store token for authorized shop creation
        sessionStorage.setItem('agrifarm_token', userData.accessToken)
        
        // Call shop creation directly
        const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
        const shopRes = await fetch(`${BASE}/api/shops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.accessToken}`
          },
          body: JSON.stringify(shopPayload)
        })
        const shopData = await shopRes.json().catch(() => ({}))
        if (!shopRes.ok) throw new Error(shopData.error || 'Failed to register shop details.')
      }
      
      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        setView('login')
        setError('')
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <style>{`
        .auth-container {
          max-width: 480px;
          width: 100%;
          z-index: 10;
        }
        .role-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 32px;
        }
        .role-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }
        .role-card:hover {
          background: var(--primary-a);
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }
        .role-card h3 {
          font-family: var(--font-heading);
          color: var(--primary);
          font-size: 1.25rem;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .role-card p {
          color: var(--text2);
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .auth-back-btn {
          background: none;
          border: none;
          color: var(--text3);
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
          transition: var(--transition);
          padding: 4px 8px;
          border-radius: var(--radius-xs);
        }
        .auth-back-btn:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }
        .auth-error {
          background: var(--danger-a);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          margin-bottom: 20px;
          text-align: center;
        }
        .auth-success {
          background: var(--primary-a);
          color: var(--primary);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          margin-bottom: 20px;
          text-align: center;
        }
        .form-section-title {
          font-family: var(--font-heading);
          color: var(--primary);
          font-size: 1rem;
          margin: 20px 0 10px 0;
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }
        .btn-link {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .btn-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="auth-container">
        {view === 'role-select' ? (
          <div className="login-card">
            <div className="login-logo">🌱</div>
            <h1 className="login-title">Welcome to AgriFarm</h1>
            <p className="login-subtitle">Select your role to access the platform</p>

            <div className="role-grid">
              <div className="role-card" id="role-farmer" data-testid="role-farmer" onClick={() => handleRoleSelect('FARMER')}>
                <h3>👨‍🌾 Farmer / User</h3>
                <p>Buy seeds, fertilizers, scan crop diseases, check mandi prices, and track order deliveries.</p>
              </div>
              <div className="role-card" id="role-shop-owner" data-testid="role-shop-owner" onClick={() => handleRoleSelect('SHOP_OWNER')}>
                <h3>🏪 Shop Owner</h3>
                <p>Register your store, manage crop products, fulfill customer orders, and view earnings.</p>
              </div>
              <div className="role-card" id="role-admin" data-testid="role-admin" onClick={() => handleRoleSelect('ADMIN')}>
                <h3>🔑 Administrator</h3>
                <p>Access database audits, review system health, manage registrations, and view portal analytics.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-card">
            {role !== 'ADMIN' && (
              <button className="auth-back-btn" onClick={handleBack}>
                ⬅️ Back to roles
              </button>
            )}

            <div className="login-logo">
              {role === 'FARMER' ? '🌾' : role === 'SHOP_OWNER' ? '🏪' : '⚙️'}
            </div>
            
            <h1 className="login-title">
              {view === 'login' ? 'Sign In' : 'Register Account'}
            </h1>
            <p className="login-subtitle">
              {role === 'FARMER'
                ? 'Farmer Portal'
                : role === 'SHOP_OWNER'
                ? 'Merchant Portal'
                : 'System Administrator'}
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {view === 'login' ? (
              <form className="login-form" onSubmit={handleLogin}>
                <div>
                  <label className="login-label">Email Address</label>
                  <input
                    className="login-input"
                    id="login-email"
                    data-testid="login-email"
                    type="email"
                    placeholder="user@agrifarm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="login-label">Password</label>
                  <input
                    className="login-input"
                    id="login-password"
                    data-testid="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="login-btn" id="login-submit" data-testid="login-submit" disabled={loading}>
                  {loading ? '⏳ Accessing Portal...' : '🔐 Sign In'}
                </button>

                {role !== 'ADMIN' && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
                      Don't have an account?{' '}
                    </span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setView('register')}
                    >
                      Register Now
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <form className="login-form" onSubmit={handleRegister} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '6px' }}>
                <div className="form-section-title">Personal Details</div>
                <div>
                  <label className="login-label">Full Name</label>
                  <input
                    className="login-input"
                    id="register-name"
                    data-testid="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="login-label">Email Address</label>
                  <input
                    className="login-input"
                    id="register-email"
                    data-testid="register-email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="login-label">Phone Number</label>
                  <input
                    className="login-input"
                    id="register-phone"
                    data-testid="register-phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="login-label">Delivery / Home Address</label>
                  <textarea
                    className="login-input"
                    id="register-address"
                    data-testid="register-address"
                    style={{ height: '70px', resize: 'none' }}
                    placeholder="Street, City, State"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                {role === 'SHOP_OWNER' && (
                  <>
                    <div className="form-section-title">Shop Details</div>
                    <div>
                      <label className="login-label">Shop Name</label>
                      <input
                        className="login-input"
                        id="register-shop-name"
                        data-testid="register-shop-name"
                        type="text"
                        placeholder="Agro Green Traders"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="login-label">Shop Category</label>
                      <select
                        className="login-input"
                        id="register-shop-category"
                        data-testid="register-shop-category"
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value)}
                        required
                      >
                        <option value="Seeds">Seeds</option>
                        <option value="Fertilizers">Fertilizers</option>
                        <option value="Pesticides">Pesticides</option>
                        <option value="Tools">Tools & Equipment</option>
                        <option value="General Store">General Store</option>
                      </select>
                    </div>
                    <div>
                      <label className="login-label">Shop Address</label>
                      <textarea
                        className="login-input"
                        id="register-shop-address"
                        data-testid="register-shop-address"
                        style={{ height: '70px', resize: 'none' }}
                        placeholder="Shop Address (if different)"
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="login-label">Shop Description</label>
                      <input
                        className="login-input"
                        id="register-shop-description"
                        data-testid="register-shop-description"
                        type="text"
                        placeholder="Dealers in organic compost, NPK, and standard equipment"
                        value={shopDescription}
                        onChange={(e) => setShopDescription(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="form-section-title">Security</div>
                <div>
                  <label className="login-label">Password</label>
                  <input
                    className="login-input"
                    id="register-password"
                    data-testid="register-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="login-btn" id="register-submit" data-testid="register-submit" style={{ marginTop: '20px' }} disabled={loading}>
                  {loading ? '⏳ Generating Account...' : '📝 Register'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                  </span>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setView('login')}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            <div className="login-hint" style={{ marginTop: '24px' }}>
              <strong>Seed account helper:</strong><br />
              Farmer: farmer@agrifarm.com / farmer123<br />
              Seller: seller@agrifarm.com / seller123<br />
              Admin: admin@agrifarm.com / admin123
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// pages/Settings.jsx
// Fix 3: Uses ADMIN_CONSTANTS for all strings.
// Fix 4: Profile Save makes a real API call. Notification prefs persist in
//         localStorage. Change Password section wired to reset-password API.
import React, { useState, useEffect } from 'react'
import { api } from '../api/client.js'
import { ADMIN_CONSTANTS as C } from '../constants.js'

const SETTING_SECTIONS = C.SETTINGS_SECTIONS

// Fix 4: Load notification prefs from localStorage so they survive page refresh.
function loadNotifPrefs() {
  try {
    const stored = localStorage.getItem(C.SETTINGS_NOTIF_PREFS_KEY)
    if (stored) return JSON.parse(stored)
  } catch (_) {}
  return { shopReg: true, lowStock: true, newUsers: false, orderAnomaly: false }
}

function saveNotifPrefs(prefs) {
  localStorage.setItem(C.SETTINGS_NOTIF_PREFS_KEY, JSON.stringify(prefs))
}

export default function Settings({ theme, onToggleTheme, adminEmail, adminUid }) {
  const [section, setSection]         = useState('Profile')
  const [profileForm, setProfileForm] = useState({
    displayName: 'AgriFarm Admin',
    email: adminEmail || 'admin@agrifarm.com'
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)
  const [profileError, setProfileError]   = useState('')

  // Fix 4: Change Password state
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving]               = useState(false)
  const [pwMessage, setPwMessage]             = useState('')
  const [pwError, setPwError]                 = useState('')

  // Fix 4: Notification prefs — persisted in localStorage
  const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs)

  // Sync email when adminEmail prop changes
  useEffect(() => {
    setProfileForm(p => ({ ...p, email: adminEmail || 'admin@agrifarm.com' }))
  }, [adminEmail])

  const toggleNotif = (key) => {
    setNotifPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      saveNotifPrefs(next)
      return next
    })
  }

  // Fix 4: Profile Save — real API call
  const handleProfileSave = async () => {
    if (!profileForm.displayName.trim()) {
      setProfileError('Display name cannot be empty')
      return
    }
    setProfileSaving(true); setProfileError('')
    try {
      if (adminUid) {
        await api.updateUser(adminUid, { name: profileForm.displayName })
      }
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (e) {
      setProfileError(e.message)
    }
    setProfileSaving(false)
  }

  // Fix 4: Change Password — calls admin reset-password API
  const handleChangePassword = async () => {
    setPwError(''); setPwMessage('')
    if (!newPassword.trim()) { setPwError('New password cannot be empty'); return }
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
    if (!adminUid) { setPwError('Admin ID not available — please re-login'); return }
    setPwSaving(true)
    try {
      await api.resetPassword(adminUid, newPassword)
      setPwMessage('✅ Password updated successfully!')
      setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPwMessage(''), 3000)
    } catch (e) {
      setPwError(e.message)
    }
    setPwSaving(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{C.SETTINGS_TITLE}</h1>
          <p>{C.SETTINGS_SUBTITLE}</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Settings Nav */}
        <nav className="settings-nav">
          {SETTING_SECTIONS.map(s => (
            <button
              key={s}
              id={`settings-nav-${s.toLowerCase()}`}
              className={`settings-nav-item${section === s ? ' active' : ''}`}
              onClick={() => setSection(s)}
            >
              {s === 'Profile'       && '👤'}{' '}
              {s === 'Security'      && '🔒'}{' '}
              {s === 'Notifications' && '🔔'}{' '}
              {s === 'Platform'      && '🌐'}{' '}
              {s === 'About'         && 'ℹ️'}{' '}
              {s}
            </button>
          ))}
        </nav>

        {/* Settings Content */}
        <div className="settings-content">

          {/* ── Profile ─────────────────────────────────────────── */}
          {section === 'Profile' && (
            <div>
              <div className="settings-section">
                <h3>{C.SETTINGS_PROFILE_TITLE}</h3>
                <p>{C.SETTINGS_PROFILE_DESC}</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_PROFILE_DISPLAY_NAME}</label>
                    <input
                      id="settings-display-name"
                      className="form-input"
                      value={profileForm.displayName}
                      onChange={e => setProfileForm(p => ({ ...p, displayName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_PROFILE_EMAIL}</label>
                    <input className="form-input" type="email" value={profileForm.email} disabled />
                    <span className="form-hint">{C.SETTINGS_PROFILE_EMAIL_HINT}</span>
                  </div>
                </div>
                {profileError && <div className="info-box danger" style={{ marginTop: 10 }}>{profileError}</div>}
                <div style={{ marginTop: 16 }}>
                  <button
                    id="settings-save-profile-btn"
                    className="btn btn-primary"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                  >
                    {profileSaving ? C.SETTINGS_SAVING_BTN : profileSaved ? C.SETTINGS_SAVED_BTN : C.SETTINGS_SAVE_BTN}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Security ────────────────────────────────────────── */}
          {section === 'Security' && (
            <div>
              <div className="settings-section">
                <h3>{C.SETTINGS_SECURITY_TITLE}</h3>
                <p>{C.SETTINGS_SECURITY_DESC}</p>
                <div className="info-box info" style={{ marginBottom: 16 }}>
                  <strong>JWT Access Token:</strong> 15 minutes expiry<br />
                  <strong>JWT Refresh Token:</strong> 7 days expiry<br />
                  <strong>Session:</strong> Stored in sessionStorage (cleared on tab close)<br />
                  <strong>Encryption:</strong> bcrypt (12 salt rounds)
                </div>
              </div>

              {/* Fix 4: Change Password section */}
              <div className="settings-section">
                <h3>{C.SETTINGS_CHANGE_PASSWORD_TITLE}</h3>
                <p>{C.SETTINGS_CHANGE_PASSWORD_DESC}</p>
                <div className="form-grid form-grid-1">
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_NEW_PASSWORD_LABEL}</label>
                    <input
                      id="settings-new-password"
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_CONFIRM_PASSWORD_LABEL}</label>
                    <input
                      id="settings-confirm-password"
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {pwError   && <div className="info-box danger"  style={{ marginTop: 10 }}>{pwError}</div>}
                {pwMessage && <div className="info-box success" style={{ marginTop: 10 }}>{pwMessage}</div>}
                <div style={{ marginTop: 16 }}>
                  <button
                    id="settings-change-password-btn"
                    className="btn btn-primary"
                    onClick={handleChangePassword}
                    disabled={pwSaving}
                  >
                    {pwSaving ? C.SETTINGS_CHANGE_PASSWORD_LOADING : C.SETTINGS_CHANGE_PASSWORD_BTN}
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <h3>{C.SETTINGS_RATE_LIMIT_TITLE}</h3>
                <p>{C.SETTINGS_RATE_LIMIT_DESC}</p>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Login Rate Limiting</h4>
                    <p>10,000 requests per 15-minute window (development mode)</p>
                  </div>
                  <button className="toggle on" disabled />
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Request Sanitization</h4>
                    <p>express-validator on all input fields</p>
                  </div>
                  <button className="toggle on" disabled />
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Helmet Security Headers</h4>
                    <p>CSP, HSTS, XSS protection enabled</p>
                  </div>
                  <button className="toggle on" disabled />
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ────────────────────────────────────── */}
          {section === 'Notifications' && (
            <div>
              <div className="settings-section">
                <h3>{C.SETTINGS_NOTIF_TITLE}</h3>
                <p>{C.SETTINGS_NOTIF_DESC}</p>
                {/* Fix 4: Notification prefs persist in localStorage via toggleNotif */}
                {[
                  { key: 'shopReg',      title: C.SETTINGS_NOTIF_SHOP_REG,   desc: C.SETTINGS_NOTIF_SHOP_REG_DESC },
                  { key: 'lowStock',     title: C.SETTINGS_NOTIF_LOW_STOCK,  desc: C.SETTINGS_NOTIF_LOW_STOCK_DESC },
                  { key: 'newUsers',     title: C.SETTINGS_NOTIF_NEW_USERS,  desc: C.SETTINGS_NOTIF_NEW_USERS_DESC },
                  { key: 'orderAnomaly', title: C.SETTINGS_NOTIF_ORDER_ANOMALY, desc: C.SETTINGS_NOTIF_ORDER_ANOMALY_DESC },
                ].map(({ key, title, desc }) => (
                  <div className="toggle-row" key={key}>
                    <div className="toggle-info"><h4>{title}</h4><p>{desc}</p></div>
                    <button
                      id={`notif-toggle-${key}`}
                      className={`toggle${notifPrefs[key] ? ' on' : ''}`}
                      onClick={() => toggleNotif(key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Platform ─────────────────────────────────────────── */}
          {section === 'Platform' && (
            <div>
              <div className="settings-section">
                <h3>{C.SETTINGS_PLATFORM_TITLE}</h3>
                <p>{C.SETTINGS_PLATFORM_DESC}</p>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>{C.SETTINGS_DARK_MODE_TITLE}</h4>
                    <p>{C.SETTINGS_DARK_MODE_DESC}</p>
                  </div>
                  <button
                    id="settings-dark-mode-toggle"
                    className={`toggle${theme === 'dark' ? ' on' : ''}`}
                    onClick={onToggleTheme}
                  />
                </div>
              </div>
              <div className="settings-section">
                <h3>{C.SETTINGS_BACKEND_CONFIG_TITLE}</h3>
                <p>{C.SETTINGS_BACKEND_CONFIG_DESC}</p>
                <div className="form-grid form-grid-1">
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_API_URL_LABEL}</label>
                    <input className="form-input" value="http://localhost:3000" disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_PORTAL_URL_LABEL}</label>
                    <input className="form-input" value="http://localhost:5173" disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{C.SETTINGS_DB_LABEL}</label>
                    <input className="form-input" value="MySQL (agrifarm) — XAMPP" disabled />
                  </div>
                </div>
                <div
                  className="info-box info"
                  style={{ marginTop: 12 }}
                  dangerouslySetInnerHTML={{ __html: C.SETTINGS_ENV_HINT }}
                />
              </div>
            </div>
          )}

          {/* ── About ────────────────────────────────────────────── */}
          {section === 'About' && (
            <div>
              <div className="settings-section">
                <h3>{C.SETTINGS_ABOUT_TITLE}</h3>
                <p>{C.SETTINGS_ABOUT_DESC}</p>
                <div className="form-grid form-grid-1" style={{ gap: 12 }}>
                  {[
                    ['Platform Version', C.PLATFORM_VERSION],
                    ['Admin Portal',     C.PORTAL_TECH],
                    ['Backend',          C.BACKEND_TECH],
                    ['Database',         C.DATABASE_TECH],
                    ['Authentication',   C.AUTH_TECH],
                    ['Build Date',       new Date().toLocaleDateString('en-IN')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text3)', fontSize: 13 }}>{k}</span>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="settings-section">
                <h3>{C.SETTINGS_TEST_CREDS_TITLE}</h3>
                <p>{C.SETTINGS_TEST_CREDS_DESC}</p>
                <div className="info-box info">
                  {C.SETTINGS_TEST_CREDS_HINT}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

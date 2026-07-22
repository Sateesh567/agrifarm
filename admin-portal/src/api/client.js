// ── api/client.js ─────────────────────────────────────────────
// Centralized API client with automatic auth headers and error handling
// BASE URL is read from .env (VITE_API_BASE_URL) — never hardcoded

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

const getToken = () => sessionStorage.getItem('agrifarm_token') || sessionStorage.getItem('agrifarm_admin_token') || ''

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

async function request(path, options = {}) {
  let res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })

  // If token is expired (401), try to refresh it automatically
  if (res.status === 401 && !path.includes('/api/auth/refresh') && !path.includes('/api/auth/login')) {
    const userStr = sessionStorage.getItem('agrifarm_user')
    let refreshToken = null
    try {
      refreshToken = JSON.parse(userStr || '{}').refreshToken
    } catch (e) {}

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshRes = await fetch(`${BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json()
            const newToken = refreshData.accessToken
            sessionStorage.setItem('agrifarm_token', newToken)
            
            // Also update token inside cached agrifarm_user object
            if (userStr) {
              try {
                const userObj = JSON.parse(userStr)
                userObj.accessToken = newToken
                if (refreshData.refreshToken) {
                  userObj.refreshToken = refreshData.refreshToken
                }
                sessionStorage.setItem('agrifarm_user', JSON.stringify(userObj))
              } catch (e) {}
            }
            
            isRefreshing = false
            onRefreshed(newToken)
          } else {
            // Refresh token revoked or expired, clear and force reload to login
            isRefreshing = false
            sessionStorage.clear()
            window.location.reload()
            throw new Error('Session expired. Please sign in again.')
          }
        } catch (refreshErr) {
          isRefreshing = false
          sessionStorage.clear()
          window.location.reload()
          throw refreshErr
        }
      }

      // Queue the current request and wait for refresh completion
      const retryRequest = new Promise(resolve => {
        subscribeTokenRefresh(token => {
          const updatedOptions = {
            ...options,
            headers: {
              ...options.headers,
              ...authHeaders(),
              'Authorization': `Bearer ${token}`
            }
          }
          resolve(fetch(`${BASE}${path}`, updatedOptions))
        })
      })

      // Resolve the fetched response from the retried request
      res = await retryRequest
      // Check if retry was itself successful
      if (res && typeof res.json !== 'function') {
        // Fallback retry using fetch directly
        res = await fetch(`${BASE}${path}`, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${sessionStorage.getItem('agrifarm_token')}`
          }
        })
      }
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────────
  login: (email, password, role = 'ADMIN') =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),

  // ── Dashboard ────────────────────────────────────────────────
  getDashboard: () => request('/api/admin/dashboard'),

  // ── Shops (Admin Enhanced) ───────────────────────────────────
  getAdminShops: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/admin/shops${q ? '?' + q : ''}`)
  },
  getShops: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/shops${q ? '?' + q : ''}`)
  },
  getShopById: (id) => request(`/api/shops/${id}`),
  updateShopStatus: (shopId, status) =>
    request(`/api/shops/${shopId}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  deleteShop: (shopId) =>
    request(`/api/shops/${shopId}`, { method: 'DELETE' }),

  // ── Products ────────────────────────────────────────────────
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/products${q ? '?' + q : ''}`)
  },
  addProduct: (data) =>
    request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (productId, data) =>
    request(`/api/products/${productId}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteProduct: (productId) =>
    request(`/api/products/${productId}`, { method: 'DELETE' }),

  // ── Orders ──────────────────────────────────────────────────
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/orders${q ? '?' + q : ''}`)
  },
  updateOrderStatus: (orderId, status) =>
    request(`/api/orders/${orderId}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  // ── Users ────────────────────────────────────────────────────
  getUsers: () => request('/api/users'),
  deleteUser: (uid) => request(`/api/users/${uid}`, { method: 'DELETE' }),
  blockUser: (uid, reason) =>
    request(`/api/admin/users/${uid}/block`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  unblockUser: (uid) =>
    request(`/api/admin/users/${uid}/unblock`, { method: 'PATCH' }),
  resetPassword: (uid, newPassword) =>
    request(`/api/admin/users/${uid}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  updateUser: (uid, data) =>
    request('/api/users/update', { method: 'POST', body: JSON.stringify({ uid, ...data }) }),
  registerUser: (data) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // ── Admin Shops Extended CRUD ────────────────────────────────
  createAdminShop: (data) =>
    request('/api/admin/shops', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminShop: (shopId, data) =>
    request(`/api/admin/shops/${shopId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Reports ──────────────────────────────────────────────────
  getRegistrationReport: () => request('/api/admin/reports/registrations'),
  getRevenueReport: () => request('/api/admin/reports/revenue'),

  // ── Audit Logs ───────────────────────────────────────────────
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/admin/audit-logs${q ? '?' + q : ''}`)
  },

  // ── Mandi Prices ─────────────────────────────────────────────
  getMandiPrices: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/admin/mandi-prices${q ? '?' + q : ''}`)
  },
  addMandiPrice: (data) =>
    request('/api/admin/mandi-prices', { method: 'POST', body: JSON.stringify(data) }),
  updateMandiPrice: (id, data) =>
    request(`/api/admin/mandi-prices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMandiPrice: (id) =>
    request(`/api/admin/mandi-prices/${id}`, { method: 'DELETE' }),

  // ── Crop Diseases ────────────────────────────────────────────
  getCropDiseases: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/admin/crop-diseases${q ? '?' + q : ''}`)
  },
  addCropDisease: (data) =>
    request('/api/admin/crop-diseases', { method: 'POST', body: JSON.stringify(data) }),
  updateCropDisease: (id, data) =>
    request(`/api/admin/crop-diseases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCropDisease: (id) =>
    request(`/api/admin/crop-diseases/${id}`, { method: 'DELETE' }),

  // ── Weather Forecasts ────────────────────────────────────────
  getWeatherForecasts: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/admin/weather-forecasts${q ? '?' + q : ''}`)
  },
  addWeatherForecast: (data) =>
    request('/api/admin/weather-forecasts', { method: 'POST', body: JSON.stringify(data) }),
  updateWeatherForecast: (id, data) =>
    request(`/api/admin/weather-forecasts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWeatherForecast: (id) =>
    request(`/api/admin/weather-forecasts/${id}`, { method: 'DELETE' }),

  // ── Farmer Wishlist ──────────────────────────────────────────
  getWishlist: () =>
    request('/api/wishlist'),
  toggleWishlist: (productId) =>
    request(`/api/wishlist/${productId}`, { method: 'POST' }),

  // ── Farmer Orders ────────────────────────────────────────────
  placeOrder: (data) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

  // ── Reviews ──────────────────────────────────────────────────
  submitReview: (data) =>
    request('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getProductReviews: (productId) =>
    request(`/api/products/${productId}/reviews`),

  // ── Notifications ────────────────────────────────────────────
  getNotifications: () =>
    request('/api/notifications'),
  markNotificationRead: (id) =>
    request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request('/api/notifications/read-all', { method: 'PATCH' }),

  // ── Public Info ──────────────────────────────────────────────
  getPublicMandiPrices: (district = '') =>
    request(`/api/mandi-prices${district ? '?district=' + encodeURIComponent(district) : ''}`),
  getPublicCropDiseases: (crop = '') =>
    request(`/api/crop-diseases${crop ? '?crop=' + encodeURIComponent(crop) : ''}`),
  getPublicWeather: () =>
    request('/api/weather'),

  // ── User Settings ────────────────────────────────────────────
  updateUserProfileMe: (data) =>
    request('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
}
export const exportCSV = (data, filename, columns) => {
  const header = columns.map(c => c.label).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      const val = String(c.key(row) ?? '')
      return val.includes(',') ? `"${val}"` : val
    }).join(',')
  ).join('\n')
  const blob = new Blob([header + '\n' + rows], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

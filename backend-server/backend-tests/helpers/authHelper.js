import { config } from '../config/config.js';

export async function getAuthToken(email, password, role) {
  try {
    const res = await fetch(`${config.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role })
    });
    if (res.status === 404) {
      const regRes = await fetch(`${config.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: role === 'ADMIN' ? 'AgriFarm Admin' : (role === 'SHOP_OWNER' ? 'Test Seller' : 'Test Farmer'),
          email,
          password,
          role,
          phone: role === 'FARMER' ? '9876543210' : '9876543211',
          address: 'Test Address'
        })
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        return regData.accessToken;
      }
      throw new Error(`Login failed (404) and registration failed with status ${regRes.status}`);
    }
    if (!res.ok) {
      throw new Error(`Login failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.accessToken;
  } catch (err) {
    console.error(`Failed to get auth token for ${email}:`, err.message);
    throw err;
  }
}

export function getFarmerToken() {
  return getAuthToken('farmer@agrifarm.com', 'farmer123', 'FARMER');
}

export function getSellerToken() {
  return getAuthToken('seller@agrifarm.com', 'seller123', 'SHOP_OWNER');
}

export function getAdminToken() {
  return getAuthToken('admin@agrifarm.com', 'admin123', 'ADMIN');
}

const fs = require('fs');
const path = 'C:\\Users\\Boyapati Aswini\\AndroidStudioProjects\\agrifarm\\admin-portal\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\\n');

content = content.replace(
  'const ordersRes = await fetch(`${BACKEND_URL}/api/orders`)',
  'const ordersRes = await fetch(`${BACKEND_URL}/api/orders`, { headers: authHeaders() })'
);

content = content.replace(
  'const usersRes = await fetch(`${BACKEND_URL}/api/users`)',
  'const usersRes = await fetch(`${BACKEND_URL}/api/users`, { headers: authHeaders() })'
);

content = content.replace(
  "const res = await fetch(`${BACKEND_URL}/api/shops/${shopId}/status`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },",
  "const res = await fetch(`${BACKEND_URL}/api/shops/${shopId}/status`, {\n        method: 'POST',\n        headers: authHeaders(),"
);

content = content.replace(
  "const res = await fetch(`${BACKEND_URL}/api/shops/${shopId}`, { method: 'DELETE' })",
  "const res = await fetch(`${BACKEND_URL}/api/shops/${shopId}`, { method: 'DELETE', headers: authHeaders() })"
);

content = content.replace(
  "const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, { method: 'DELETE' })",
  "const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, { method: 'DELETE', headers: authHeaders() })"
);

content = content.replace(
  "const res = await fetch(url, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },",
  "const res = await fetch(url, {\n        method: 'POST',\n        headers: authHeaders(),"
);

content = content.replace(
  "const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },",
  "const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {\n        method: 'POST',\n        headers: authHeaders(),"
);

content = content.replace(
  "const res = await fetch(`${BACKEND_URL}/api/users/${uid}`, { method: 'DELETE' })",
  "const res = await fetch(`${BACKEND_URL}/api/users/${uid}`, { method: 'DELETE', headers: authHeaders() })"
);

const userSubmitTarget = "    try {\n      const res = await fetch(url, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },";
const userSubmitReplacement = "    try {\n      const res = await fetch(url, {\n        method: 'POST',\n        headers: authHeaders(),";
content = content.split(userSubmitTarget).join(userSubmitReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully fixed all headers in App.jsx');
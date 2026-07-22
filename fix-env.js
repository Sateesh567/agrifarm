const fs = require('fs');
const path = 'C:\\Users\\Boyapati Aswini\\AndroidStudioProjects\\agrifarm\\backend-server\\.env';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('RATE_LIMIT_MAX=100', 'RATE_LIMIT_MAX=10000');
content = content.replace('LOGIN_RATE_LIMIT_MAX=5', 'LOGIN_RATE_LIMIT_MAX=10000');
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated rate limits in .env');
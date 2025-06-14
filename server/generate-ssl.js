const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sslDir = path.join(__dirname, 'ssl');

// Ensure SSL directory exists
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

const certPath = path.join(sslDir, 'cert.pem');
const keyPath = path.join(sslDir, 'key.pem');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('SSL certificates already exist');
  process.exit(0);
}

try {
  console.log('Generating SSL certificates...');
  
  // Generate self-signed certificate
  execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, {
    stdio: 'inherit'
  });
  
  console.log('SSL certificates generated successfully');
  console.log(`Certificate: ${certPath}`);
  console.log(`Private Key: ${keyPath}`);
} catch (error) {
  console.error('Error generating SSL certificates:', error.message);
  console.log('\nPlease ensure OpenSSL is installed on your system.');
  console.log('On macOS: brew install openssl');
  console.log('On Ubuntu/Debian: sudo apt-get install openssl');
  console.log('On Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  process.exit(1);
}
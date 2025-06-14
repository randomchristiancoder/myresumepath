import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// SSL Configuration utility
export const getSSLConfig = () => {
  const certPath = path.join(__dirname, 'ssl', 'cert.pem')
  const keyPath = path.join(__dirname, 'ssl', 'key.pem')
  
  // Check if SSL certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        available: true
      }
    } catch (error) {
      console.warn('SSL certificates found but could not be read:', error.message)
      return { available: false }
    }
  }
  
  console.log('SSL certificates not found. Server will run on HTTP.')
  console.log('To enable HTTPS:')
  console.log('1. Create a "ssl" directory in the server folder')
  console.log('2. Add your SSL certificate as "cert.pem"')
  console.log('3. Add your private key as "key.pem"')
  console.log('4. Restart the server')
  
  return { available: false }
}

// Generate self-signed certificate for development (optional)
export const generateSelfSignedCert = async () => {
  const { spawn } = await import('child_process')
  const sslDir = path.join(__dirname, 'ssl')
  
  // Create SSL directory if it doesn't exist
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true })
  }
  
  return new Promise((resolve, reject) => {
    const openssl = spawn('openssl', [
      'req', '-x509', '-newkey', 'rsa:4096', '-keyout', 'key.pem',
      '-out', 'cert.pem', '-days', '365', '-nodes',
      '-subj', '/C=US/ST=State/L=City/O=Organization/CN=localhost'
    ], { cwd: sslDir })
    
    openssl.on('close', (code) => {
      if (code === 0) {
        console.log('Self-signed SSL certificate generated successfully')
        resolve(true)
      } else {
        console.log('Failed to generate SSL certificate. OpenSSL may not be installed.')
        resolve(false)
      }
    })
    
    openssl.on('error', (error) => {
      console.log('OpenSSL not available:', error.message)
      resolve(false)
    })
  })
}
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// SSL Configuration utility - DEPRECATED
// This application now runs on HTTP only for simplicity
export const getSSLConfig = () => {
  console.log('SSL configuration disabled - application runs on HTTP only')
  return { available: false }
}

// Generate self-signed certificate - DEPRECATED
export const generateSelfSignedCert = async () => {
  console.log('SSL certificate generation disabled - application runs on HTTP only')
  return false
}
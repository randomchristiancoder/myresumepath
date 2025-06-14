#!/usr/bin/env node

// Validation Suite Runner
// This script should be run in Node.js environment, not in the browser

import ValidationSuite from './validation-suite.js'

async function runValidation() {
  try {
    // Check if we're in Node.js environment
    if (typeof window !== 'undefined') {
      console.error('❌ Validation suite should be run in Node.js, not in browser')
      console.log('💡 Run this command in terminal: node test/run-validation.js')
      return
    }

    const baseUrl = process.env.VALIDATION_URL || 'http://localhost:3001'
    const validator = new ValidationSuite(baseUrl)
    
    console.log('🚀 Starting validation suite...')
    console.log(`📍 Target server: ${baseUrl}`)
    
    const report = await validator.runFullValidation()
    
    if (report.summary.failed > 0) {
      console.log('\n⚠️  Some tests failed. Check the detailed report for more information.')
      process.exit(1)
    } else {
      console.log('\n✅ All tests passed successfully!')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ Validation suite encountered an error:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation()
}
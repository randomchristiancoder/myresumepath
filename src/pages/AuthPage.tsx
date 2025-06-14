import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

const AuthPage: React.FC = () => {
  const { user, signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        // Provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          if (email === 'admin@myresumepath.com') {
            setError('Admin account not found. Please check the ADMIN_SETUP_INSTRUCTIONS.md file for setup steps.')
          } else {
            setError('Invalid email or password. Please check your credentials and try again.')
          }
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Try signing in instead.')
        } else {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillAdminCredentials = () => {
    setEmail('admin@myresumepath.com')
    setPassword('AdminPass123!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl shadow-lg">
              <BrainCircuit className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Resume Path
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-slate-600">
            {isSignUp 
              ? 'Start your journey to career success' 
              : 'Sign in to continue your career journey'
            }
          </p>
        </div>

        {/* Admin Test Account Helper */}
        {!isSignUp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">Testing with Admin Account</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Use the admin test credentials to explore all features.
                </p>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 underline"
                >
                  Fill admin credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>{error}</div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <User className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  ) : (
                    'Sign In'
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
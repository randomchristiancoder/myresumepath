import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { validateEmail, validatePassword } from '../utils/validation'

const AuthPage: React.FC = () => {
  const { user, signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const validateForm = () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (isSignUp) {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0])
        return false
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)

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
        } else if (error.message.includes('Signup disabled')) {
          setError('New registrations are currently disabled. Please contact support.')
        } else {
          setError(error.message)
        }
      } else if (isSignUp) {
        setSuccess('Account created successfully! Please check your email for verification.')
        setIsSignUp(false)
        setPassword('')
        setConfirmPassword('')
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
    setError('')
    setSuccess('')
  }

  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    
    const score = validation.errors.length
    if (score === 0) return { strength: 100, label: 'Strong', color: 'text-green-400' }
    if (score <= 2) return { strength: 60, label: 'Medium', color: 'text-yellow-400' }
    return { strength: 30, label: 'Weak', color: 'text-red-400' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      {/* Skip Link for Accessibility */}
      <a href="#main-form" className="skip-link">
        Skip to sign in form
      </a>

      <div className="max-w-md w-full space-y-8">
        {/* Header with Enhanced Accessibility */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 card-hover interactive warm-glow">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl">
                  <BrainCircuit className="h-8 w-8 text-black" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                    My Resume Path
                  </span>
                  <p className="text-xs text-gray-400">AI-Powered Career Platform</p>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-orange-400" aria-hidden="true" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-300 text-wrap">
            {isSignUp 
              ? 'Start your journey to career success with AI-powered insights' 
              : 'Sign in to continue your career development journey'
            }
          </p>
        </div>

        {/* Admin Test Account Helper */}
        {!isSignUp && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-orange-500/30 rounded-xl p-4 card-hover warm-border-glow">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">Demo Account Available</h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 text-wrap">
                  Try the platform with pre-loaded sample data and full admin access.
                </p>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="mt-2 text-xs sm:text-sm font-medium text-orange-400 hover:text-orange-300 underline transition-colors interactive"
                  aria-label="Fill in demo account credentials"
                >
                  Use demo credentials →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form with Enhanced Accessibility */}
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 card-hover">
          <form className="space-y-6" onSubmit={handleSubmit} id="main-form" role="main">
            <h2 className="sr-only">{isSignUp ? 'Create Account Form' : 'Sign In Form'}</h2>
            
            {error && (
              <div className="status-error" role="alert" aria-live="polite">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-wrap text-sm">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="status-success" role="alert" aria-live="polite">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-wrap text-sm">{success}</div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label text-sm">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label text-sm">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  aria-describedby={isSignUp && password.length > 0 ? 'password-strength' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-300 transition-colors interactive z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator for sign up */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2" id="password-strength" aria-live="polite">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Password strength</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1" role="progressbar" aria-valuenow={passwordStrength.strength} aria-valuemin={0} aria-valuemax={100} aria-label={`Password strength: ${passwordStrength.label}`}>
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        passwordStrength.strength >= 60 ? 'bg-green-500' : 
                        passwordStrength.strength >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                    aria-describedby={password !== confirmPassword && confirmPassword.length > 0 ? 'password-match-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-300 transition-colors interactive z-10"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <p id="password-match-error" className="form-error text-xs" role="alert">
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-black bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 interactive"
              aria-describedby={loading ? 'loading-status' : undefined}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" aria-hidden="true"></div>
                  <span id="loading-status">Processing...</span>
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <User className="h-5 w-5 mr-2" aria-hidden="true" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-5 w-5 mr-2" aria-hidden="true" />
                      Sign In
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors interactive"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Features preview with Enhanced Accessibility */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 card-hover">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4 text-center">
            What you'll get access to:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm" role="list" aria-label="Platform features">
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span className="text-gray-300 text-safe">AI Resume Analysis</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span className="text-gray-300 text-safe">Career Matching</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span className="text-gray-300 text-safe">Skill Gap Analysis</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span className="text-gray-300 text-safe">Course Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
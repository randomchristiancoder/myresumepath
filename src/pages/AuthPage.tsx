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
    if (score === 0) return { strength: 100, label: 'Strong', color: 'text-green-600' }
    if (score <= 2) return { strength: 60, label: 'Medium', color: 'text-yellow-600' }
    return { strength: 30, label: 'Weak', color: 'text-red-600' }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Skip Link for Accessibility */}
      <a href="#main-form" className="skip-link">
        Skip to sign in form
      </a>

      <div className="max-w-md w-full space-y-8">
        {/* Header with Enhanced Accessibility */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center space-x-3 p-4 bg-white rounded-2xl shadow-xl border border-slate-200 card-hover interactive">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <BrainCircuit className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Resume Path
                  </span>
                  <p className="text-xs text-slate-600">AI-Powered Career Platform</p>
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500" aria-hidden="true" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-slate-600">
            {isSignUp 
              ? 'Start your journey to career success with AI-powered insights' 
              : 'Sign in to continue your career development journey'
            }
          </p>
        </div>

        {/* Admin Test Account Helper */}
        {!isSignUp && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 card-hover">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">Demo Account Available</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Try the platform with pre-loaded sample data and full admin access.
                </p>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 underline transition-colors interactive"
                  aria-label="Fill in demo account credentials"
                >
                  Use demo credentials →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form with Enhanced Accessibility */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 card-hover">
          <form className="space-y-6" onSubmit={handleSubmit} id="main-form" role="main">
            <h2 className="sr-only">{isSignUp ? 'Create Account Form' : 'Sign In Form'}</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm" role="alert" aria-live="polite">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm" role="alert" aria-live="polite">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>{success}</div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter your email"
                  aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                  placeholder="Enter your password"
                  aria-describedby={isSignUp && password.length > 0 ? 'password-strength' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-600 transition-colors interactive"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator for sign up */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2" id="password-strength" aria-live="polite">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Password strength</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1" role="progressbar" aria-valuenow={passwordStrength.strength} aria-valuemin={0} aria-valuemax={100} aria-label={`Password strength: ${passwordStrength.label}`}>
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
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                    placeholder="Confirm your password"
                    aria-describedby={password !== confirmPassword && confirmPassword.length > 0 ? 'password-match-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-600 transition-colors interactive"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {password !== confirmPassword && confirmPassword.length > 0 && (
                  <p id="password-match-error" className="mt-1 text-sm text-red-600" role="alert">
                    Passwords do not match
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 interactive"
              aria-describedby={loading ? 'loading-status' : undefined}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true"></div>
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
              className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors interactive"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Features preview with Enhanced Accessibility */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 card-hover">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
            What you'll get access to:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm" role="list" aria-label="Platform features">
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-slate-700">AI Resume Analysis</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-slate-700">Career Matching</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-slate-700">Skill Gap Analysis</span>
            </div>
            <div className="flex items-center space-x-2" role="listitem">
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
              <span className="text-slate-700">Course Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Shield, 
  Users, 
  Activity, 
  BarChart3, 
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Crown,
  Trash2,
  Plus,
  RefreshCw,
  Database,
  Server,
  Lock,
  Zap,
  FileText,
  Upload,
  Brain,
  Target,
  TestTube,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'

interface AdminStats {
  users: {
    total: number
    active: number
  }
  resumes: {
    total: number
  }
  assessments: {
    total: number
  }
  reports: {
    total: number
  }
}

interface SystemValidation {
  timestamp: string
  requestedBy: {
    userId: string
    email: string
    role: string
  }
  server: {
    status: string
    uptime: number
    memory: any
    version: string
  }
  database: {
    status: string
    connection: boolean
    error?: string
  }
  ssl: {
    enabled: boolean
    certificate: string
  }
  endpoints: Record<string, any>
  features: Record<string, string>
}

interface TestResult {
  name: string
  category: string
  status: 'passed' | 'failed' | 'skipped' | 'running'
  duration?: number
  result?: any
  error?: string
  reason?: string
}

interface TestSuiteReport {
  timestamp: string
  summary: {
    totalTests: number
    passed: number
    failed: number
    skipped: number
    successRate: string
  }
  categorySummary: Record<string, any>
  tests: TestResult[]
  recommendations: string[]
}

interface UserWithRoles {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  roles: Array<{
    role: string
    granted_at: string
    expires_at?: string
  }>
}

interface ActivityItem {
  type: string
  id: string
  user_id: string
  details: any
  created_at: string
}

const AdminPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'validation' | 'activity' | 'testing'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [validation, setValidation] = useState<SystemValidation | null>(null)
  const [validationLoading, setValidationLoading] = useState(false)
  const [testSuiteReport, setTestSuiteReport] = useState<TestSuiteReport | null>(null)
  const [testSuiteRunning, setTestSuiteRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

  useEffect(() => {
    checkAdminAccess()
  }, [user])

  const checkAdminAccess = async () => {
    if (!user) return

    try {
      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)

      if (error) throw error

      const hasAdminRole = roles.some(role => {
        if (!role.is_active) return false
        if (role.expires_at && new Date(role.expires_at) <= new Date()) return false
        return true
      })

      if (!hasAdminRole) {
        setError('Access denied. Administrator privileges required.')
        return
      }

      // Load admin data
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadActivity()
      ])
    } catch (err) {
      console.error('Admin access check failed:', err)
      setError('Failed to verify admin access')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to load stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const loadUsers = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to load users')
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const loadActivity = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/activity`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to load activity')
      const data = await response.json()
      setActivity(data.activity)
    } catch (err) {
      console.error('Failed to load activity:', err)
    }
  }

  const runSystemValidation = async () => {
    setValidationLoading(true)
    setError(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/validate/system`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Administrator privileges required.')
        }
        throw new Error('System validation failed')
      }

      const data = await response.json()
      setValidation(data)
      setSuccess('System validation completed successfully')
    } catch (err: any) {
      console.error('System validation failed:', err)
      setError(err.message || 'System validation failed')
    } finally {
      setValidationLoading(false)
    }
  }

  const runTestSuite = async () => {
    setTestSuiteRunning(true)
    setError(null)
    setTestSuiteReport(null)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/run-tests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Administrator privileges required.')
        }
        throw new Error('Test suite execution failed')
      }

      const data = await response.json()
      setTestSuiteReport(data)
      
      if (data.summary.failed > 0) {
        setError(`Test suite completed with ${data.summary.failed} failed tests`)
      } else {
        setSuccess('All tests passed successfully!')
      }
    } catch (err: any) {
      console.error('Test suite failed:', err)
      setError(err.message || 'Test suite execution failed')
    } finally {
      setTestSuiteRunning(false)
    }
  }

  const grantAdminRole = async (userId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/grant-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to grant admin role')

      setSuccess('Admin role granted successfully')
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to grant admin role')
    }
  }

  const revokeAdminRole = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke admin privileges from this user?')) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('No session')

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/revoke-admin`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (!response.ok) throw new Error('Failed to revoke admin role')

      setSuccess('Admin role revoked successfully')
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to revoke admin role')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': 
      case 'passed': 
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error': 
      case 'failed': 
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': 
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'running': 
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      case 'skipped': 
        return <Clock className="h-5 w-5 text-gray-500" />
      default: 
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload': return <Upload className="h-4 w-4 text-blue-500" />
      case 'assessment_completed': return <Brain className="h-4 w-4 text-purple-500" />
      case 'report_generated': return <FileText className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityDescription = (item: ActivityItem) => {
    switch (item.type) {
      case 'resume_upload':
        return `Uploaded resume: ${item.details.filename}`
      case 'assessment_completed':
        return `Completed ${item.details.assessment_type} assessment`
      case 'report_generated':
        return 'Generated career report'
      default:
        return 'Unknown activity'
    }
  }

  const getTestCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'bg-blue-100 text-blue-800'
      case 'core': return 'bg-green-100 text-green-800'
      case 'ai': return 'bg-purple-100 text-purple-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'performance': return 'bg-orange-100 text-orange-800'
      case 'data': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !validation && !testSuiteReport) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            System administration and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span>Administrator: {user?.email}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 mr-3" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-3" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'validation', label: 'System Validation', icon: Settings },
            { id: 'testing', label: 'Testing Suite', icon: TestTube },
            { id: 'activity', label: 'Activity Log', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.users.total || 0}</p>
                  <p className="text-green-600 text-sm">{stats?.users.active || 0} active</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Resumes</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.resumes.total || 0}</p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Assessments</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.assessments.total || 0}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Reports</p>
                  <p className="text-3xl font-bold text-slate-900">{stats?.reports.total || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={runSystemValidation}
                disabled={validationLoading}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {validationLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                System Validation
              </button>
              
              <button
                onClick={runTestSuite}
                disabled={testSuiteRunning}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {testSuiteRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Run Test Suite
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </button>
              
              <button
                onClick={() => setActiveTab('activity')}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
              <button
                onClick={loadUsers}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Roles</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Last Sign In</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-900">{userItem.email}</p>
                            <p className="text-sm text-slate-500">
                              Joined {new Date(userItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {userItem.roles.length > 0 ? (
                            userItem.roles.map((role, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  role.role === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {role.role}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              user
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {userItem.last_sign_in_at
                          ? new Date(userItem.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {userItem.roles.some(r => r.role === 'admin') ? (
                            <button
                              onClick={() => revokeAdminRole(userItem.id)}
                              disabled={userItem.id === user?.id}
                              className="flex items-center px-2 py-1 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={userItem.id === user?.id ? "Cannot revoke your own admin role" : "Revoke admin role"}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Revoke Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => grantAdminRole(userItem.id)}
                              className="flex items-center px-2 py-1 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Grant Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">System Validation Suite</h3>
              <button
                onClick={runSystemValidation}
                disabled={validationLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {validationLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Run Validation
              </button>
            </div>

            {validation && (
              <div className="space-y-6">
                {/* Validation Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">Validation Complete</h4>
                      <p className="text-blue-700 text-sm">
                        Requested by {validation.requestedBy.email} at {new Date(validation.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900 flex items-center">
                        <Server className="h-4 w-4 mr-2 text-green-600" />
                        Server
                      </h5>
                      {getStatusIcon(validation.server.status)}
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>Uptime: {formatUptime(validation.server.uptime)}</p>
                      <p>Memory: {formatMemory(validation.server.memory.heapUsed)}</p>
                      <p>Version: {validation.server.version}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900 flex items-center">
                        <Database className="h-4 w-4 mr-2 text-blue-600" />
                        Database
                      </h5>
                      {getStatusIcon(validation.database.status)}
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>Connection: {validation.database.connection ? 'Active' : 'Failed'}</p>
                      {validation.database.error && (
                        <p className="text-red-600">Error: {validation.database.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900 flex items-center">
                        <Lock className="h-4 w-4 mr-2 text-purple-600" />
                        SSL/Security
                      </h5>
                      {getStatusIcon(validation.ssl.enabled ? 'operational' : 'warning')}
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>SSL: {validation.ssl.enabled ? 'Enabled' : 'Disabled'}</p>
                      <p>Certificate: {validation.ssl.certificate}</p>
                    </div>
                  </div>
                </div>

                {/* Endpoints Status */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h5 className="font-medium text-slate-900 mb-3">API Endpoints</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(validation.endpoints).map(([name, endpoint]: [string, any]) => (
                      <div key={name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-900">{name}</span>
                        <div className="flex items-center space-x-2">
                          {endpoint.adminOnly && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Admin Only</span>
                          )}
                          <span className="text-xs text-slate-600">{endpoint.method}</span>
                          {getStatusIcon(endpoint.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Status */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h5 className="font-medium text-slate-900 mb-3">System Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(validation.features).map(([name, status]: [string, any]) => (
                      <div key={name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-900 capitalize">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            status === 'operational' 
                              ? 'bg-green-100 text-green-800'
                              : status === 'conditional'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <TestTube className="h-6 w-6 mr-3 text-purple-600" />
                  Comprehensive Testing Suite
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Run automated tests to validate system functionality, performance, and security
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {testSuiteReport && (
                  <button
                    onClick={() => setTestSuiteReport(null)}
                    className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear Results
                  </button>
                )}
                <button
                  onClick={runTestSuite}
                  disabled={testSuiteRunning}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {testSuiteRunning ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Test Suite
                    </>
                  )}
                </button>
              </div>
            </div>

            {testSuiteRunning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Running Comprehensive Test Suite</h4>
                    <p className="text-blue-700 text-sm">
                      Testing system health, core functionality, AI integration, security, and performance...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {testSuiteReport && (
              <div className="space-y-6">
                {/* Test Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-900">{testSuiteReport.summary.totalTests}</div>
                    <div className="text-sm text-slate-600">Total Tests</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-900">{testSuiteReport.summary.passed}</div>
                    <div className="text-sm text-green-700">Passed</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-900">{testSuiteReport.summary.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-900">{testSuiteReport.summary.skipped}</div>
                    <div className="text-sm text-yellow-700">Skipped</div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Success Rate</span>
                    <span className="text-sm font-bold text-slate-900">{testSuiteReport.summary.successRate}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: testSuiteReport.summary.successRate }}
                    ></div>
                  </div>
                </div>

                {/* Category Summary */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Test Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(testSuiteReport.categorySummary).map(([category, summary]: [string, any]) => (
                      <div key={category} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getTestCategoryColor(category)}`}>
                            {category}
                          </span>
                          <span className="text-sm text-slate-600">{summary.total} tests</span>
                        </div>
                        <div className="flex space-x-2 text-xs">
                          <span className="text-green-600">✓ {summary.passed}</span>
                          <span className="text-red-600">✗ {summary.failed}</span>
                          <span className="text-yellow-600">⏭ {summary.skipped}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Test Results */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Detailed Test Results</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testSuiteReport.tests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <span className="font-medium text-slate-900">{test.name}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTestCategoryColor(test.category)}`}>
                                {test.category}
                              </span>
                              {test.duration && (
                                <span className="text-xs text-slate-500">{test.duration}ms</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {test.error && (
                            <p className="text-xs text-red-600 max-w-xs truncate">{test.error}</p>
                          )}
                          {test.reason && (
                            <p className="text-xs text-yellow-600 max-w-xs truncate">{test.reason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {testSuiteReport.recommendations.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {testSuiteReport.recommendations.map((rec, index) => (
                        <li key={index} className="text-yellow-800 text-sm flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!testSuiteReport && !testSuiteRunning && (
              <div className="text-center py-12">
                <TestTube className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Test Results</h3>
                <p className="text-slate-600 mb-6">
                  Run the comprehensive test suite to validate system functionality and performance
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">System Health</h4>
                    <p className="text-blue-700 text-sm">Server status, database connectivity, SSL configuration</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Core Features</h4>
                    <p className="text-green-700 text-sm">File upload, resume parsing, report generation</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">AI Integration</h4>
                    <p className="text-purple-700 text-sm">Job matching, course recommendations, personality analysis</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Security</h4>
                    <p className="text-red-700 text-sm">CORS configuration, SSL setup, authentication</p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Performance</h4>
                    <p className="text-orange-700 text-sm">Response times, system metrics</p>
                  </div>
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <h4 className="font-medium text-cyan-900 mb-2">Data Validation</h4>
                    <p className="text-cyan-700 text-sm">Resume parsing accuracy, data integrity</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <button
                onClick={loadActivity}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {activity.length > 0 ? (
                activity.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {getActivityDescription(item)}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-slate-500">
                        <span>User: {item.user_id.substring(0, 8)}...</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
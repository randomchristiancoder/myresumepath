import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  LayoutDashboard, 
  Upload, 
  Target, 
  FileText, 
  User, 
  LogOut,
  BrainCircuit,
  Key,
  Shield,
  Menu,
  X,
  Bell,
  Settings,
  ChevronDown,
  Activity
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    checkAdminStatus()
    loadNotifications()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) return

    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)

      if (error) return

      const hasValidAdminRole = roles.some(role => {
        if (!role.is_active) return false
        if (role.expires_at && new Date(role.expires_at) <= new Date()) return false
        return true
      })

      setIsAdmin(hasValidAdminRole)
    } catch (error) {
      console.error('Admin check failed:', error)
    }
  }

  const loadNotifications = async () => {
    if (!user) return

    try {
      // Count recent activity items
      const { count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      setNotifications(count || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview and insights'
    },
    { 
      name: 'Upload Resume', 
      href: '/upload', 
      icon: Upload,
      description: 'Upload and analyze'
    },
    { 
      name: 'Career Analysis', 
      href: '/analysis', 
      icon: Target,
      description: 'Skills and personality'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: FileText,
      description: 'Generated reports'
    },
    { 
      name: 'API Keys', 
      href: '/api-keys', 
      icon: Key,
      description: 'AI provider settings'
    },
  ]

  // Add admin navigation if user is admin
  if (isAdmin) {
    navigation.push({ 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: Shield,
      description: 'System administration'
    })
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  My Resume Path
                </span>
                <p className="text-blue-100 text-xs">Career Development Platform</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
                  } ${item.name === 'Admin Panel' ? 'border border-red-200 bg-red-50 hover:bg-red-100' : ''}`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  {item.name === 'Admin Panel' && (
                    <Shield className="ml-auto h-4 w-4 text-red-500" />
                  )}
                  {notifications > 0 && item.name === 'Dashboard' && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t border-slate-200 p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                        Administrator
                      </span>
                    )}
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Online
                    </span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/api-keys')
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/reports')
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Activity className="h-4 w-4 mr-3" />
                    Activity
                  </button>
                  <hr className="my-2 border-slate-200" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top bar for mobile */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-slate-900">My Resume Path</span>
          </div>
          <div className="flex items-center space-x-2">
            {notifications > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
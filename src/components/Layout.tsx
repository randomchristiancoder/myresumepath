import React from 'react'
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
  TestTube
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminStatus()
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

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', href: '/upload', icon: Upload },
    { name: 'Skill Analysis', href: '/analysis', icon: Target },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'API Keys', href: '/api-keys', icon: Key },
  ]

  // Add admin navigation if user is admin
  if (isAdmin) {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: Shield })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-slate-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Resume Path
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  } ${item.name === 'Admin Panel' ? 'border border-red-200 bg-red-50 hover:bg-red-100' : ''}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.name === 'Admin Panel' && (
                    <Shield className="ml-auto h-4 w-4 text-red-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <p className="text-xs text-red-600 font-medium">Administrator</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
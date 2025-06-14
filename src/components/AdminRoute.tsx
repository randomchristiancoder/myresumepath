import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Shield, XCircle } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [user])

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, is_active, expires_at')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)

      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const hasValidAdminRole = roles.some(role => {
        if (!role.is_active) return false
        if (role.expires_at && new Date(role.expires_at) <= new Date()) return false
        return true
      })

      setIsAdmin(hasValidAdminRole)
    } catch (error) {
      console.error('Admin check failed:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You need administrator privileges to access this page. Please contact your system administrator if you believe this is an error.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mb-6">
            <Shield className="h-4 w-4" />
            <span>Administrator access required</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminRoute
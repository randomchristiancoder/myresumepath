import { supabase } from '../config/supabase.js'

// Middleware to verify user authentication
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// Middleware to verify admin role
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if user has admin role
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role, is_active, expires_at')
      .eq('user_id', req.user.id)
      .eq('role', 'admin')
      .eq('is_active', true)

    if (error) {
      console.error('Error checking admin role:', error)
      return res.status(500).json({ error: 'Failed to verify admin status' })
    }

    const activeAdminRole = roles.find(role => {
      if (!role.is_active) return false
      if (role.expires_at && new Date(role.expires_at) <= new Date()) return false
      return true
    })

    if (!activeAdminRole) {
      return res.status(403).json({ 
        error: 'Admin access required',
        message: 'This endpoint requires administrator privileges'
      })
    }

    req.userRole = 'admin'
    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    res.status(500).json({ error: 'Failed to verify admin status' })
  }
}

// Middleware to get user roles (non-blocking)
export const getUserRoles = async (req, res, next) => {
  try {
    if (!req.user) {
      req.userRoles = []
      return next()
    }

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user roles:', error)
      req.userRoles = []
    } else {
      req.userRoles = roles.map(r => r.role)
    }

    next()
  } catch (error) {
    console.error('Get user roles error:', error)
    req.userRoles = []
    next()
  }
}
import express from 'express'
import { supabase } from '../config/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Apply authentication middleware to all admin routes
router.use(requireAuth)
router.use(requireAdmin)

// Get all users with their roles
router.get('/users', async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }

    // Get roles for all users
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, is_active, granted_at, expires_at')
      .eq('is_active', true)

    if (rolesError) {
      throw rolesError
    }

    // Combine user data with roles
    const usersWithRoles = users.users.map(user => {
      const userRoles = roles.filter(role => role.user_id === user.id)
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: userRoles.map(role => ({
          role: role.role,
          granted_at: role.granted_at,
          expires_at: role.expires_at
        }))
      }
    })

    res.json({ users: usersWithRoles })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Grant admin role to user
router.post('/users/:userId/grant-admin', async (req, res) => {
  try {
    const { userId } = req.params
    
    // Use the grant_admin_role function
    const { data, error } = await supabase.rpc('grant_admin_role', {
      target_user_id: userId,
      granted_by_user_id: req.user.id
    })

    if (error) {
      throw error
    }

    res.json({ 
      success: true, 
      message: 'Admin role granted successfully' 
    })
  } catch (error) {
    console.error('Error granting admin role:', error)
    res.status(500).json({ error: error.message || 'Failed to grant admin role' })
  }
})

// Revoke admin role from user
router.delete('/users/:userId/revoke-admin', async (req, res) => {
  try {
    const { userId } = req.params
    
    // Don't allow users to revoke their own admin role
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot revoke your own admin role' })
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('role', 'admin')
      .eq('is_active', true)

    if (error) {
      throw error
    }

    res.json({ 
      success: true, 
      message: 'Admin role revoked successfully' 
    })
  } catch (error) {
    console.error('Error revoking admin role:', error)
    res.status(500).json({ error: 'Failed to revoke admin role' })
  }
})

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [usersResult, resumesResult, assessmentsResult, reportsResult] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from('resumes').select('*', { count: 'exact', head: true }),
      supabase.from('assessments').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true })
    ])

    const stats = {
      users: {
        total: usersResult.data?.users?.length || 0,
        active: usersResult.data?.users?.filter(u => u.last_sign_in_at).length || 0
      },
      resumes: {
        total: resumesResult.count || 0
      },
      assessments: {
        total: assessmentsResult.count || 0
      },
      reports: {
        total: reportsResult.count || 0
      },
      timestamp: new Date().toISOString()
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: 'Failed to fetch system statistics' })
  }
})

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50

    const [recentResumes, recentAssessments, recentReports] = await Promise.all([
      supabase
        .from('resumes')
        .select('id, filename, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('assessments')
        .select('id, assessment_type, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('reports')
        .select('id, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(limit)
    ])

    const activity = [
      ...(recentResumes.data || []).map(item => ({
        type: 'resume_upload',
        id: item.id,
        user_id: item.user_id,
        details: { filename: item.filename },
        created_at: item.created_at
      })),
      ...(recentAssessments.data || []).map(item => ({
        type: 'assessment_completed',
        id: item.id,
        user_id: item.user_id,
        details: { assessment_type: item.assessment_type },
        created_at: item.created_at
      })),
      ...(recentReports.data || []).map(item => ({
        type: 'report_generated',
        id: item.id,
        user_id: item.user_id,
        details: {},
        created_at: item.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit)

    res.json({ activity })
  } catch (error) {
    console.error('Error fetching admin activity:', error)
    res.status(500).json({ error: 'Failed to fetch recent activity' })
  }
})

export default router
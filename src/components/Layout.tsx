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
  Activity,
  Star,
  Clock,
  Eye,
  Brain,
  TrendingUp,
  Award,
  MousePointer,
  ChevronRight
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

interface RecentActivity {
  id: string
  type: 'resume_upload' | 'assessment_completed' | 'report_generated'
  title: string
  description: string
  created_at: string
  metadata?: {
    filename?: string
    resumeId?: string
    skillsCount?: number
    extractionQuality?: string
  }
}

interface CareerInsight {
  type: 'skill' | 'experience' | 'recommendation' | 'match'
  title: string
  value: string
  color: string
  icon: React.ComponentType<any>
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [careerInsights, setCareerInsights] = useState<CareerInsight[]>([])
  const [clickingActivity, setClickingActivity] = useState<string | null>(null)

  useEffect(() => {
    checkAdminStatus()
    loadNotifications()
    loadRecentActivity()
    loadCareerInsights()
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

  const loadRecentActivity = async () => {
    if (!user) return

    try {
      const [resumesResult, assessmentsResult, reportsResult] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2),
        supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2)
      ])

      const activities: RecentActivity[] = []

      // Add resume uploads
      if (resumesResult.data) {
        resumesResult.data.forEach(resume => {
          const skillsCount = resume.parsed_data?.skills ? 
            Object.values(resume.parsed_data.skills).flat().length : 0
          
          activities.push({
            id: resume.id,
            type: 'resume_upload',
            title: 'Resume Analyzed',
            description: `${resume.filename} • ${skillsCount} skills`,
            created_at: resume.created_at,
            metadata: {
              filename: resume.filename,
              resumeId: resume.id,
              skillsCount,
              extractionQuality: 'High Quality'
            }
          })
        })
      }

      // Add assessments
      if (assessmentsResult.data) {
        assessmentsResult.data.forEach(assessment => {
          activities.push({
            id: assessment.id,
            type: 'assessment_completed',
            title: 'Assessment Complete',
            description: `${assessment.assessment_type} analysis`,
            created_at: assessment.created_at
          })
        })
      }

      // Add reports
      if (reportsResult.data) {
        reportsResult.data.forEach(report => {
          activities.push({
            id: report.id,
            type: 'report_generated',
            title: 'Report Generated',
            description: 'Career development report',
            created_at: report.created_at
          })
        })
      }

      // Sort by date and take most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activities.slice(0, 4))

    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadCareerInsights = async () => {
    if (!user) return

    try {
      // Get latest resume for insights
      const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const insights: CareerInsight[] = []

      if (resumes && resumes.length > 0) {
        const latestResume = resumes[0]
        const parsedData = latestResume.parsed_data

        // Skills insight
        if (parsedData?.skills) {
          const totalSkills = Object.values(parsedData.skills).flat().length
          insights.push({
            type: 'skill',
            title: 'Skills Identified',
            value: `${totalSkills} skills`,
            color: 'text-blue-600',
            icon: Target
          })
        }

        // Experience insight
        if (parsedData?.analysis?.experienceLevel) {
          insights.push({
            type: 'experience',
            title: 'Experience Level',
            value: parsedData.analysis.experienceLevel,
            color: 'text-green-600',
            icon: TrendingUp
          })
        }

        // Leadership insight
        if (parsedData?.analysis?.leadershipExperience) {
          insights.push({
            type: 'recommendation',
            title: 'Leadership Ready',
            value: 'Management potential',
            color: 'text-purple-600',
            icon: Award
          })
        }

        // Career match insight
        insights.push({
          type: 'match',
          title: 'Career Match',
          value: '94% Senior Engineer',
          color: 'text-orange-600',
          icon: Star
        })
      }

      setCareerInsights(insights)

    } catch (error) {
      console.error('Error loading career insights:', error)
    }
  }

  const handleActivityClick = async (activity: RecentActivity) => {
    if (clickingActivity === activity.id) return

    setClickingActivity(activity.id)

    try {
      switch (activity.type) {
        case 'resume_upload':
          if (activity.metadata?.resumeId) {
            // Fetch full resume data
            const { data: resume, error } = await supabase
              .from('resumes')
              .select('*')
              .eq('id', activity.metadata.resumeId)
              .single()

            if (error) {
              console.error('Error fetching resume:', error)
              return
            }

            // Store view data and navigate
            const viewData = {
              parsedData: resume.parsed_data,
              filename: resume.filename,
              uploadedAt: resume.created_at,
              resumeId: resume.id,
              content: resume.content,
              aiEnhanced: true,
              extractionQuality: 'High Quality'
            }

            localStorage.setItem('viewResumeData', JSON.stringify(viewData))
            navigate('/upload?view=true')
          }
          break
        case 'assessment_completed':
          navigate('/analysis')
          break
        case 'report_generated':
          navigate('/reports')
          break
      }
    } catch (error) {
      console.error('Error handling activity click:', error)
    } finally {
      setClickingActivity(null)
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload': return <Upload className="h-4 w-4 text-blue-500" />
      case 'assessment_completed': return <Brain className="h-4 w-4 text-purple-500" />
      case 'report_generated': return <FileText className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'resume_upload': return 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
      case 'assessment_completed': return 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
      case 'report_generated': return 'border-green-200 hover:border-green-400 hover:bg-green-50'
      default: return 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }
  }

  const isActivityClickable = (activity: RecentActivity) => {
    return (
      (activity.type === 'resume_upload' && activity.metadata?.resumeId) ||
      activity.type === 'assessment_completed' ||
      activity.type === 'report_generated'
    )
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
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
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
          <nav className="space-y-2 p-4">
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

          {/* Recent Activity Section */}
          <div className="px-4 pb-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-green-600" />
                  Recent Activity
                </h3>
                {recentActivity.length > 0 && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View All
                  </button>
                )}
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity, index) => {
                    const isClickable = isActivityClickable(activity)
                    const isClicking = clickingActivity === activity.id
                    
                    return (
                      <div 
                        key={index} 
                        className={`relative flex items-start space-x-2 p-2 rounded-lg border transition-all duration-200 ${
                          isClickable
                            ? `cursor-pointer ${getActivityColor(activity.type)} hover:shadow-sm` 
                            : getActivityColor(activity.type)
                        } ${isClicking ? 'opacity-75 scale-95' : ''}`}
                        onClick={() => {
                          if (isClickable && !isClicking) {
                            handleActivityClick(activity)
                          }
                        }}
                      >
                        {isClicking && (
                          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center text-xs text-slate-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(activity.created_at).toLocaleDateString()}
                            </div>
                            {isClickable && (
                              <ChevronRight className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Career Insights Section */}
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-purple-600" />
                  Career Insights
                </h3>
                {careerInsights.length > 0 && (
                  <button 
                    onClick={() => navigate('/analysis')}
                    className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    View More
                  </button>
                )}
              </div>
              
              {careerInsights.length > 0 ? (
                <div className="space-y-2">
                  {careerInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2">
                        <insight.icon className={`h-3 w-3 ${insight.color}`} />
                        <div>
                          <p className="text-xs font-medium text-slate-900">{insight.title}</p>
                          <p className={`text-xs ${insight.color}`}>{insight.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-purple-600 text-xs mb-2">Upload resume for insights</p>
                  <button 
                    onClick={() => navigate('/upload')}
                    className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="border-t border-slate-200 p-4 mt-auto">
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
      <div className="lg:pl-80">
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
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
  ChevronRight,
  Trophy,
  BarChart3,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
  Building,
  Calendar,
  Filter,
  Search,
  RefreshCw
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

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  type: 'full-time' | 'part-time' | 'contract' | 'remote'
  posted: string
  description: string
  skills: string[]
  match?: number
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
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobSearchTerm, setJobSearchTerm] = useState('')

  useEffect(() => {
    checkAdminStatus()
    loadNotifications()
    loadRecentActivity()
    loadCareerInsights()
    loadJobListings()
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

        // Skills insight - Show actual count from resume
        if (parsedData?.skills) {
          const totalSkills = Object.values(parsedData.skills).flat().length
          insights.push({
            type: 'skill',
            title: 'Skills Identified',
            value: `${totalSkills} skills`,
            color: 'text-orange-400',
            icon: Target
          })
        }

        // Experience insight
        if (parsedData?.analysis?.experienceLevel) {
          insights.push({
            type: 'experience',
            title: 'Experience Level',
            value: parsedData.analysis.experienceLevel,
            color: 'text-green-400',
            icon: TrendingUp
          })
        }

        // Leadership insight
        if (parsedData?.analysis?.leadershipExperience) {
          insights.push({
            type: 'recommendation',
            title: 'Leadership Ready',
            value: 'Management potential',
            color: 'text-purple-400',
            icon: Award
          })
        }

        // Career match insight
        insights.push({
          type: 'match',
          title: 'Career Match',
          value: '94% Senior Engineer',
          color: 'text-orange-400',
          icon: Star
        })
      }

      setCareerInsights(insights)

    } catch (error) {
      console.error('Error loading career insights:', error)
    }
  }

  const loadJobListings = async () => {
    setJobsLoading(true)
    try {
      // Mock job listings - in production, this would call job board APIs
      const mockJobs: JobListing[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          salary: '$140k - $180k',
          type: 'full-time',
          posted: '2 days ago',
          description: 'Join our team building scalable web applications...',
          skills: ['React', 'Node.js', 'TypeScript'],
          match: 94
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          salary: '$120k - $160k',
          type: 'remote',
          posted: '1 week ago',
          description: 'Build the future of fintech with our growing team...',
          skills: ['JavaScript', 'Python', 'AWS'],
          match: 87
        },
        {
          id: '3',
          title: 'Frontend Engineer',
          company: 'Design Co',
          location: 'New York, NY',
          salary: '$110k - $140k',
          type: 'full-time',
          posted: '3 days ago',
          description: 'Create beautiful user experiences...',
          skills: ['React', 'CSS', 'Figma'],
          match: 82
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Austin, TX',
          salary: '$130k - $170k',
          type: 'full-time',
          posted: '5 days ago',
          description: 'Manage cloud infrastructure and deployment pipelines...',
          skills: ['AWS', 'Docker', 'Kubernetes'],
          match: 78
        }
      ]

      setJobListings(mockJobs)
    } catch (error) {
      console.error('Error loading job listings:', error)
    } finally {
      setJobsLoading(false)
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
      name: 'Skill Analysis', 
      href: '/analysis', 
      icon: Target,
      description: 'Skills and career insights'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: FileText,
      description: 'Generated reports'
    },
    { 
      name: 'Progress', 
      href: '/progress', 
      icon: Trophy,
      description: 'Track achievements'
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
      case 'resume_upload': return <Upload className="h-4 w-4 text-orange-400" />
      case 'assessment_completed': return <Brain className="h-4 w-4 text-purple-400" />
      case 'report_generated': return <FileText className="h-4 w-4 text-green-400" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'resume_upload': return 'border-orange-500/30 hover:border-orange-400 hover:bg-orange-500/10'
      case 'assessment_completed': return 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
      case 'report_generated': return 'border-green-500/30 hover:border-green-400 hover:bg-green-500/10'
      default: return 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
    }
  }

  const isActivityClickable = (activity: RecentActivity) => {
    return (
      (activity.type === 'resume_upload' && activity.metadata?.resumeId) ||
      activity.type === 'assessment_completed' ||
      activity.type === 'report_generated'
    )
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-green-100 text-green-800'
      case 'full-time': return 'bg-blue-100 text-blue-800'
      case 'part-time': return 'bg-yellow-100 text-yellow-800'
      case 'contract': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredJobs = jobListings.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(jobSearchTerm.toLowerCase()))
  )

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Skip Links for Accessibility */}
      <a href="#main-navigation" className="skip-link">
        Skip to navigation
      </a>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with Enhanced Accessibility */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 shadow-2xl border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto sidebar`} role="navigation" aria-label="Main navigation">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-700 header-gradient">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BrainCircuit className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  My Resume Path
                </span>
                <p className="text-orange-200 text-xs">Career Development Platform</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden text-white hover:text-orange-200 transition-colors interactive"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation with Enhanced Accessibility */}
          <nav className="space-y-2 p-4" id="main-navigation" role="menubar" aria-label="Main navigation menu">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${item.name === 'Admin Panel' ? 'border border-red-500/30 bg-red-500/10' : ''}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-black' : 'text-gray-400'}`} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="font-medium text-safe">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-black/70' : 'text-gray-500'} text-safe`}>
                      {item.description}
                    </div>
                  </div>
                  {item.name === 'Admin Panel' && (
                    <Shield className="ml-auto h-4 w-4 text-red-400" aria-hidden="true" />
                  )}
                  {notifications > 0 && item.name === 'Dashboard' && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-label={`${notifications} new notifications`}>
                      {notifications}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Job Board Section */}
          <div className="px-4 pb-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 card-hover">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-blue-400" aria-hidden="true" />
                  Job Board
                </h3>
                <button 
                  onClick={loadJobListings}
                  disabled={jobsLoading}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors interactive"
                  aria-label="Refresh job listings"
                >
                  <RefreshCw className={`h-3 w-3 ${jobsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Job Search */}
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={jobSearchTerm}
                  onChange={(e) => setJobSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              {jobsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400 mx-auto"></div>
                  <p className="text-gray-400 text-xs mt-2">Loading jobs...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto" role="list" aria-label="Job listings">
                  {filteredJobs.slice(0, 4).map((job) => (
                    <div 
                      key={job.id} 
                      className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-orange-400 hover:bg-gray-600 transition-all duration-200 cursor-pointer interactive"
                      role="listitem"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-white truncate-safe">
                            {job.title}
                          </h4>
                          <p className="text-xs text-blue-400 truncate-safe">{job.company}</p>
                        </div>
                        {job.match && (
                          <span className="text-xs font-bold text-green-400 ml-2">
                            {job.match}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center text-xs text-gray-400">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate-safe">{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center text-xs text-gray-400">
                            <DollarSign className="h-3 w-3 mr-1" />
                            <span className="truncate-safe">{job.salary}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getJobTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{job.posted}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-orange-400" />
                      </div>

                      {job.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-1 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-1 py-0.5 bg-gray-600 text-gray-300 rounded text-xs">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Briefcase className="h-8 w-8 text-gray-600 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-gray-500 text-xs">
                    {jobSearchTerm ? 'No jobs found' : 'No jobs available'}
                  </p>
                </div>
              )}

              {filteredJobs.length > 4 && (
                <div className="mt-3 text-center">
                  <button className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                    View All Jobs ({filteredJobs.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Section with Enhanced Accessibility */}
          <div className="px-4 pb-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 card-hover">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-green-400" aria-hidden="true" />
                  Recent Activity
                </h3>
                {recentActivity.length > 0 && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors interactive"
                    aria-label="View all recent activity"
                  >
                    View All
                  </button>
                )}
              </div>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-2" role="list" aria-label="Recent activities">
                  {recentActivity.slice(0, 3).map((activity, index) => {
                    const isClickable = isActivityClickable(activity)
                    const isClicking = clickingActivity === activity.id
                    
                    return (
                      <div 
                        key={index} 
                        className={`relative flex items-start space-x-2 p-2 rounded-lg border transition-all duration-200 ${
                          isClickable
                            ? `cursor-pointer ${getActivityColor(activity.type)} hover:shadow-sm interactive` 
                            : getActivityColor(activity.type)
                        } ${isClicking ? 'opacity-75 scale-95' : ''}`}
                        onClick={() => {
                          if (isClickable && !isClicking) {
                            handleActivityClick(activity)
                          }
                        }}
                        role={isClickable ? 'button' : 'listitem'}
                        tabIndex={isClickable ? 0 : -1}
                        onKeyDown={(e) => {
                          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault()
                            if (!isClicking) {
                              handleActivityClick(activity)
                            }
                          }
                        }}
                        aria-label={isClickable ? `${activity.title}: ${activity.description}. Click to view details.` : `${activity.title}: ${activity.description}`}
                      >
                        {isClicking && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center" aria-hidden="true">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                          </div>
                        )}
                        
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate-safe">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate-safe">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                              <time dateTime={activity.created_at}>
                                {new Date(activity.created_at).toLocaleDateString()}
                              </time>
                            </div>
                            {isClickable && (
                              <ChevronRight className="h-3 w-3 text-orange-400" aria-hidden="true" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 text-gray-600 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-gray-500 text-xs">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Career Insights Section with Enhanced Accessibility */}
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-400/10 rounded-xl p-4 border border-orange-500/30 card-hover">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Star className="h-4 w-4 mr-2 text-orange-400" aria-hidden="true" />
                  Career Insights
                </h3>
                {careerInsights.length > 0 && (
                  <button 
                    onClick={() => navigate('/analysis')}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors interactive"
                    aria-label="View more career insights"
                  >
                    View More
                  </button>
                )}
              </div>
              
              {careerInsights.length > 0 ? (
                <div className="space-y-2" role="list" aria-label="Career insights">
                  {careerInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-orange-500/20 interactive" role="listitem">
                      <div className="flex items-center space-x-2">
                        <insight.icon className={`h-3 w-3 ${insight.color}`} aria-hidden="true" />
                        <div>
                          <p className="text-xs font-medium text-white text-safe">{insight.title}</p>
                          <p className={`text-xs ${insight.color} text-safe`}>{insight.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 text-orange-400/50 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-orange-300 text-xs mb-2">Upload resume for insights</p>
                  <button 
                    onClick={() => navigate('/upload')}
                    className="text-xs bg-orange-500 text-black px-2 py-1 rounded hover:bg-orange-400 transition-colors interactive"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Info with Enhanced Accessibility */}
          <div className="border-t border-gray-700 p-4 mt-auto">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800 transition-colors interactive"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-black text-sm font-medium">
                  <User className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate-safe">
                    {user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <span className="text-xs text-red-400 font-medium bg-red-500/20 px-2 py-1 rounded">
                        Administrator
                      </span>
                    )}
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                      Online
                    </span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {/* User dropdown menu with Enhanced Accessibility */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2" role="menu" aria-label="User menu options">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/api-keys')
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 interactive"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4 mr-3" aria-hidden="true" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/progress')
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 interactive"
                    role="menuitem"
                  >
                    <BarChart3 className="h-4 w-4 mr-3" aria-hidden="true" />
                    Progress
                  </button>
                  <hr className="my-2 border-gray-700" role="separator" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 interactive"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4 mr-3" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Enhanced Accessibility */}
      <div className="lg:pl-80">
        {/* Top bar for mobile with Enhanced Accessibility */}
        <div className="lg:hidden bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between" role="banner">
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white transition-colors interactive"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-orange-400" aria-hidden="true" />
            <span className="font-semibold text-white text-safe">My Resume Path</span>
          </div>
          <div className="flex items-center space-x-2">
            {notifications > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-300" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center" aria-label={`${notifications} notifications`}>
                  {notifications}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page content with Enhanced Accessibility */}
        <main className="min-h-screen container-padding" id="main-content" role="main">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
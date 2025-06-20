import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Upload, 
  Target, 
  FileText, 
  TrendingUp, 
  Award,
  ArrowRight,
  Calendar,
  CheckCircle,
  Brain,
  Zap,
  Star,
  Clock,
  BarChart3,
  Eye,
  Users,
  Activity,
  Sparkles,
  ChevronRight,
  Plus,
  Download,
  Share,
  Bookmark,
  ExternalLink,
  MousePointer,
  RefreshCw,
  Trophy,
  Lightbulb,
  Rocket,
  Shield
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface DashboardStats {
  resumesUploaded: number
  skillsAnalyzed: number
  reportsGenerated: number
  coursesRecommended: number
}

interface RecentActivity {
  id: string
  type: 'resume_upload' | 'assessment_completed' | 'report_generated'
  title: string
  description: string
  created_at: string
  status: 'completed' | 'in_progress'
  metadata?: {
    filename?: string
    resumeId?: string
    skillsCount?: number
    experienceLevel?: string
    extractionQuality?: string
    resumeData?: any
  }
}

interface LatestResume {
  id: string
  filename: string
  parsed_data: any
  created_at: string
}

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  color: string
  enabled: boolean
  badge?: string
}

interface CareerInsight {
  type: 'skill' | 'experience' | 'recommendation' | 'match'
  title: string
  value: string
  color: string
  icon: React.ComponentType<any>
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    resumesUploaded: 0,
    skillsAnalyzed: 0,
    reportsGenerated: 0,
    coursesRecommended: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [latestResume, setLatestResume] = useState<LatestResume | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasResumeData, setHasResumeData] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [clickingActivity, setClickingActivity] = useState<string | null>(null)
  const [careerInsights, setCareerInsights] = useState<CareerInsight[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    setGreeting(getTimeBasedGreeting())
  }, [user])

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setRefreshing(true)
      
      // Fetch user statistics
      const [resumesResult, assessmentsResult, reportsResult] = await Promise.all([
        supabase.from('resumes').select('*', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('assessments').select('*', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('reports').select('*', { count: 'exact' }).eq('user_id', user.id)
      ])

      setStats({
        resumesUploaded: resumesResult.count || 0,
        skillsAnalyzed: assessmentsResult.count || 0,
        reportsGenerated: reportsResult.count || 0,
        coursesRecommended: (assessmentsResult.data?.filter(a => a.assessment_type === 'course_search').length || 0) * 3
      })

      setHasResumeData((resumesResult.count || 0) > 0)

      // Get latest resume for insights
      if (resumesResult.data && resumesResult.data.length > 0) {
        const latest = resumesResult.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
        setLatestResume(latest)
      }

      // Fetch recent activity with enhanced resume upload details
      const activities: RecentActivity[] = []
      
      // Add resume uploads with detailed metadata
      if (resumesResult.data) {
        resumesResult.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .forEach(resume => {
            const skillsCount = resume.parsed_data?.skills ? 
              Object.values(resume.parsed_data.skills).flat().length : 0
            
            activities.push({
              id: resume.id,
              type: 'resume_upload',
              title: 'Resume Uploaded & Analyzed',
              description: `${resume.filename} • ${skillsCount} skills identified`,
              created_at: resume.created_at,
              status: 'completed',
              metadata: {
                filename: resume.filename,
                resumeId: resume.id,
                skillsCount,
                experienceLevel: resume.parsed_data?.analysis?.experienceLevel,
                extractionQuality: resume.parsed_data?.analysis ? 'High Quality' : 'Standard',
                resumeData: resume
              }
            })
          })
      }

      // Add assessments
      if (assessmentsResult.data) {
        assessmentsResult.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2)
          .forEach(assessment => {
            activities.push({
              id: assessment.id,
              type: 'assessment_completed',
              title: 'Career Assessment Completed',
              description: `${assessment.assessment_type} assessment with insights`,
              created_at: assessment.created_at,
              status: 'completed'
            })
          })
      }

      // Add reports
      if (reportsResult.data) {
        reportsResult.data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 2)
          .forEach(report => {
            activities.push({
              id: report.id,
              type: 'report_generated',
              title: 'Career Report Generated',
              description: 'Comprehensive career development report with recommendations',
              created_at: report.created_at,
              status: 'completed'
            })
          })
      }

      // Sort by date and take most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activities.slice(0, 8))

      // Generate career insights
      const insights: CareerInsight[] = []

      if (resumesResult.data && resumesResult.data.length > 0) {
        const latestResume = resumesResult.data[0]
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
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleViewResumeDetails = async (activity: RecentActivity) => {
    if (!activity.metadata?.resumeId && !activity.metadata?.resumeData) {
      console.error('No resume data available for this activity')
      return
    }

    setClickingActivity(activity.id)

    try {
      let resumeData = activity.metadata.resumeData

      // If we don't have the full resume data, fetch it
      if (!resumeData && activity.metadata.resumeId) {
        const { data: resume, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', activity.metadata.resumeId)
          .single()

        if (error) {
          console.error('Error fetching resume:', error)
          return
        }
        resumeData = resume
      }

      if (!resumeData) {
        console.error('Could not load resume data')
        return
      }

      // Prepare view data
      const viewData = {
        parsedData: resumeData.parsed_data,
        filename: resumeData.filename,
        uploadedAt: resumeData.created_at,
        resumeId: resumeData.id,
        content: resumeData.content,
        aiEnhanced: true,
        extractionQuality: activity.metadata.extractionQuality || 'High Quality'
      }

      // Store in localStorage and navigate
      localStorage.setItem('viewResumeData', JSON.stringify(viewData))
      navigate('/upload?view=true')

    } catch (error) {
      console.error('Error viewing resume details:', error)
    } finally {
      setClickingActivity(null)
    }
  }

  const handleActivityClick = (activity: RecentActivity) => {
    // Prevent double clicks
    if (clickingActivity === activity.id) return

    switch (activity.type) {
      case 'resume_upload':
        if (activity.metadata?.resumeId || activity.metadata?.resumeData) {
          handleViewResumeDetails(activity)
        }
        break
      case 'assessment_completed':
        navigate('/analysis')
        break
      case 'report_generated':
        navigate('/reports')
        break
      default:
        break
    }
  }

  const statCards = [
    {
      title: 'Resumes Analyzed',
      value: stats.resumesUploaded,
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+2 this month',
      trend: 'up'
    },
    {
      title: 'Skills Identified',
      value: stats.skillsAnalyzed * 15 + stats.resumesUploaded * 12,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+15 new skills',
      trend: 'up'
    },
    {
      title: 'Reports Generated',
      value: stats.reportsGenerated,
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+1 this week',
      trend: 'up'
    },
    {
      title: 'Career Matches',
      value: stats.resumesUploaded * 4,
      icon: Award,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: 'Based on analysis',
      trend: 'neutral'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: 'Upload New Resume',
      description: 'Upload and analyze your latest resume with AI-powered insights',
      icon: Upload,
      href: '/upload',
      color: 'from-blue-500 to-cyan-500',
      enabled: true,
      badge: 'Popular'
    },
    {
      title: 'Career Assessment',
      description: 'Take our comprehensive personality and skills assessment',
      icon: Brain,
      href: '/analysis',
      color: 'from-purple-500 to-pink-500',
      enabled: hasResumeData,
      badge: hasResumeData ? 'Ready' : 'Upload Resume First'
    },
    {
      title: 'Generate Report',
      description: 'Create detailed career development reports and insights',
      icon: FileText,
      href: '/reports',
      color: 'from-green-500 to-emerald-500',
      enabled: hasResumeData,
      badge: hasResumeData ? 'Available' : 'Requires Resume'
    },
    {
      title: 'Skill Analysis',
      description: 'Identify skill gaps and get personalized recommendations',
      icon: Target,
      href: '/analysis',
      color: 'from-orange-500 to-red-500',
      enabled: hasResumeData,
      badge: 'AI-Powered'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload': return <Upload className="h-5 w-5 text-blue-500" />
      case 'assessment_completed': return <Brain className="h-5 w-5 text-purple-500" />
      case 'report_generated': return <FileText className="h-5 w-5 text-green-500" />
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'resume_upload': return 'border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg'
      case 'assessment_completed': return 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg'
      case 'report_generated': return 'border-green-200 hover:border-green-400 hover:bg-green-50 hover:shadow-lg'
      default: return 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }
  }

  const isActivityClickable = (activity: RecentActivity) => {
    return (
      (activity.type === 'resume_upload' && (activity.metadata?.resumeId || activity.metadata?.resumeData)) ||
      activity.type === 'assessment_completed' ||
      activity.type === 'report_generated'
    )
  }

  const getActivityActionText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'resume_upload':
        return activity.metadata?.resumeId || activity.metadata?.resumeData ? 'Click to view details' : ''
      case 'assessment_completed':
        return 'Click to view analysis'
      case 'report_generated':
        return 'Click to view reports'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Enhanced Header with Accessibility */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden card-hover interactive" role="banner">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-6 w-6 text-yellow-300" aria-hidden="true" />
                <span className="text-blue-100 font-medium">{greeting}</span>
              </div>
              <h1 className="text-4xl font-bold mb-3" id="main-heading">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Continue your journey to career success. Track your progress, discover new opportunities, and unlock your potential with AI-powered insights.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold" aria-label={`${stats.resumesUploaded + stats.skillsAnalyzed} total actions completed`}>
                  {stats.resumesUploaded + stats.skillsAnalyzed}
                </div>
                <div className="text-blue-200 text-sm">Total Actions</div>
              </div>
              <div className="w-px h-12 bg-blue-400 hidden lg:block" aria-hidden="true"></div>
              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold" aria-label={`${stats.reportsGenerated} reports generated`}>
                  {stats.reportsGenerated}
                </div>
                <div className="text-blue-200 text-sm">Reports Generated</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" aria-hidden="true"></div>
      </div>

      {/* Enhanced Stats Grid with Accessibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Dashboard Statistics</h2>
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group card-hover interactive"
            role="article"
            aria-labelledby={`stat-${index}-title`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors" aria-label={`${stat.value} ${stat.title.toLowerCase()}`}>
                  {stat.value}
                </p>
                <div className="flex items-center text-xs text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
                  <span aria-label={`Change: ${stat.change}`}>{stat.change}</span>
                </div>
              </div>
            </div>
            <div>
              <p id={`stat-${index}-title`} className="text-slate-600 text-sm font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Quick Actions with Accessibility */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
              <p className="text-slate-600 mt-1">Continue your career development journey</p>
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <Zap className="h-4 w-4 mr-1" aria-hidden="true" />
              <span>AI-Powered</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="region" aria-labelledby="quick-actions-heading">
            <h3 id="quick-actions-heading" className="sr-only">Quick Actions</h3>
            {quickActions.map((action, index) => (
              <div key={index} className="relative group">
                <Link
                  to={action.href}
                  className={`block bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover interactive ${
                    !action.enabled ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    if (!action.enabled) {
                      e.preventDefault()
                    }
                  }}
                  aria-describedby={`action-${index}-description`}
                  aria-disabled={!action.enabled}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {action.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        action.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p id={`action-${index}-description`} className="text-slate-600 text-sm mb-4 leading-relaxed">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>{action.enabled ? 'Get started' : 'Upload resume first'}</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Enhanced Progress Overview with Accessibility */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 card-hover" role="region" aria-labelledby="progress-heading">
            <div className="flex items-center justify-between mb-6">
              <h3 id="progress-heading" className="text-lg font-semibold text-slate-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                Your Progress
              </h3>
              <span className="text-sm font-bold text-slate-900" aria-label={`Progress: ${hasResumeData ? '75' : '25'} percent complete`}>
                {hasResumeData ? '75%' : '25%'} Complete
              </span>
            </div>
            
            <div className="mb-6">
              <div className="w-full bg-slate-200 rounded-full h-3" role="progressbar" aria-valuenow={hasResumeData ? 75 : 25} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: hasResumeData ? '75%' : '25%' }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
                <CheckCircle className={`h-5 w-5 ${hasResumeData ? 'text-green-500' : 'text-slate-300'}`} aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium text-slate-900">Resume Uploaded</span>
                  <p className="text-xs text-slate-600">AI analysis complete</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
                <CheckCircle className={`h-5 w-5 ${stats.skillsAnalyzed > 0 ? 'text-green-500' : 'text-slate-300'}`} aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium text-slate-900">Skills Analyzed</span>
                  <p className="text-xs text-slate-600">Career assessment</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
                <CheckCircle className={`h-5 w-5 ${stats.reportsGenerated > 0 ? 'text-green-500' : 'text-slate-300'}`} aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium text-slate-900">Report Generated</span>
                  <p className="text-xs text-slate-600">Career insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50">
                <CheckCircle className="h-5 w-5 text-slate-300" aria-hidden="true" />
                <div>
                  <span className="text-sm font-medium text-slate-900">Goals Set</span>
                  <p className="text-xs text-slate-600">Career planning</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sidebar with Accessibility */}
        <div className="space-y-6">
          {/* Recent Activity Section with Enhanced Accessibility */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 card-hover" role="region" aria-labelledby="activity-heading">
            <div className="flex items-center justify-between mb-6">
              <h3 id="activity-heading" className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" aria-hidden="true" />
                Recent Activity
                {recentActivity.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full" aria-label={`${recentActivity.length} recent activities`}>
                    {recentActivity.length}
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {refreshing && (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" aria-hidden="true" />
                )}
                <button 
                  onClick={fetchDashboardData}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  disabled={refreshing}
                  aria-label="Refresh activity data"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto" role="list" aria-label="Recent activities">
                {recentActivity.slice(0, 6).map((activity, index) => {
                  const isClickable = isActivityClickable(activity)
                  const isClicking = clickingActivity === activity.id
                  
                  return (
                    <div 
                      key={index} 
                      className={`relative flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 ${
                        isClickable
                          ? `cursor-pointer ${getActivityColor(activity.type)} transform hover:scale-[1.02] active:scale-[0.98] interactive` 
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
                      {/* Loading indicator */}
                      {isClicking && (
                        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10" aria-hidden="true">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.title}
                          </p>
                          {isClickable && (
                            <div className="flex items-center space-x-1 ml-2">
                              <MousePointer className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0" aria-hidden="true" />
                              <ChevronRight className="h-4 w-4 text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                            <time dateTime={activity.created_at}>
                              {new Date(activity.created_at).toLocaleDateString()}
                            </time>
                          </div>
                          {activity.metadata?.extractionQuality && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              activity.metadata.extractionQuality === 'High Quality'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {activity.metadata.extractionQuality}
                            </span>
                          )}
                        </div>
                        {isClickable && (
                          <div className="mt-2 text-xs text-blue-600 font-medium flex items-center">
                            <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
                            <span>{getActivityActionText(activity)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-500 text-sm font-medium">No recent activity</p>
                <p className="text-slate-400 text-xs mt-1">Upload a resume to get started</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors interactive"
                >
                  <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                  Upload Resume
                </Link>
              </div>
            )}
          </div>

          {/* Career Insights Section with Enhanced Accessibility */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 card-hover" role="region" aria-labelledby="insights-heading">
            <h3 id="insights-heading" className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-600" aria-hidden="true" />
              Career Insights
              {careerInsights.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full" aria-label={`${careerInsights.length} insights available`}>
                  {careerInsights.length}
                </span>
              )}
            </h3>
            {hasResumeData && latestResume ? (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <p className="text-sm font-medium text-purple-900 mb-1">Latest Resume</p>
                  <p className="text-purple-800 font-semibold">{latestResume.filename}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Uploaded <time dateTime={latestResume.created_at}>{new Date(latestResume.created_at).toLocaleDateString()}</time>
                  </p>
                </div>
                
                {careerInsights.length > 0 && (
                  <div className="space-y-3" role="list" aria-label="Career insights">
                    {careerInsights.map((insight, index) => (
                      <div key={index} className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-shadow interactive" role="listitem">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <insight.icon className={`h-4 w-4 ${insight.color}`} aria-hidden="true" />
                            <p className="text-sm font-medium text-purple-900">{insight.title}</p>
                          </div>
                          <p className={`text-sm font-semibold ${insight.color}`}>{insight.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate('/analysis')}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors interactive"
                  >
                    Start Analysis
                  </button>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="flex-1 px-3 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors interactive"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Brain className="h-12 w-12 text-purple-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-purple-700 text-sm font-medium mb-2">Get Personalized Insights</p>
                <p className="text-purple-600 text-xs mb-4">Upload your resume to unlock AI-powered career insights</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors interactive"
                >
                  <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                  Upload Resume
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats with Enhanced Accessibility */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 card-hover" role="region" aria-labelledby="quick-stats-heading">
            <h3 id="quick-stats-heading" className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                <span className="text-sm font-bold text-blue-900" aria-label={`Profile ${hasResumeData ? '75' : '25'} percent complete`}>
                  {hasResumeData ? '75%' : '25%'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Career Readiness</span>
                <span className="text-sm font-bold text-green-900">{hasResumeData ? 'High' : 'Getting Started'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">AI Analysis</span>
                <span className="text-sm font-bold text-purple-900">{hasResumeData ? 'Complete' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content landmark */}
      <div id="main-content" className="sr-only">Main dashboard content loaded</div>
    </div>
  )
}

export default Dashboard
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Upload, 
  Target, 
  FileText, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  Calendar,
  CheckCircle,
  Brain,
  Zap,
  Star,
  Clock,
  BarChart3
} from 'lucide-react'
import { Link } from 'react-router-dom'

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
}

interface LatestResume {
  id: string
  filename: string
  parsed_data: any
  created_at: string
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
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

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
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

      // Fetch recent activity
      const activities: RecentActivity[] = []
      
      // Add resume uploads
      if (resumesResult.data) {
        resumesResult.data.slice(0, 3).forEach(resume => {
          activities.push({
            id: resume.id,
            type: 'resume_upload',
            title: 'Resume Uploaded',
            description: `Uploaded ${resume.filename}`,
            created_at: resume.created_at,
            status: 'completed'
          })
        })
      }

      // Add assessments
      if (assessmentsResult.data) {
        assessmentsResult.data.slice(0, 2).forEach(assessment => {
          activities.push({
            id: assessment.id,
            type: 'assessment_completed',
            title: 'Assessment Completed',
            description: `Completed ${assessment.assessment_type} assessment`,
            created_at: assessment.created_at,
            status: 'completed'
          })
        })
      }

      // Add reports
      if (reportsResult.data) {
        reportsResult.data.slice(0, 2).forEach(report => {
          activities.push({
            id: report.id,
            type: 'report_generated',
            title: 'Report Generated',
            description: 'Career development report created',
            created_at: report.created_at,
            status: 'completed'
          })
        })
      }

      // Sort by date and take most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activities.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Resumes Uploaded',
      value: stats.resumesUploaded,
      icon: Upload,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+2 this month'
    },
    {
      title: 'Skills Analyzed',
      value: stats.skillsAnalyzed,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+5 assessments'
    },
    {
      title: 'Reports Generated',
      value: stats.reportsGenerated,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+1 this week'
    },
    {
      title: 'Courses Recommended',
      value: stats.coursesRecommended,
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: 'Based on analysis'
    }
  ]

  const quickActions = [
    {
      title: 'Upload New Resume',
      description: 'Upload and analyze your latest resume',
      icon: Upload,
      href: '/upload',
      color: 'from-blue-500 to-blue-600',
      enabled: true
    },
    {
      title: 'Skill Analysis',
      description: 'Take our career assessment quiz',
      icon: Target,
      href: '/analysis',
      color: 'from-purple-500 to-purple-600',
      enabled: hasResumeData
    },
    {
      title: 'View Reports',
      description: 'Access your career development reports',
      icon: FileText,
      href: '/reports',
      color: 'from-green-500 to-green-600',
      enabled: hasResumeData
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload': return <Upload className="h-4 w-4 text-blue-500" />
      case 'assessment_completed': return <Brain className="h-4 w-4 text-purple-500" />
      case 'report_generated': return <FileText className="h-4 w-4 text-green-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.email?.split('@')[0]}!
            </h1>
            <p className="text-blue-100 text-lg">
              Continue your journey to career success. Track your progress and discover new opportunities.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.resumesUploaded + stats.skillsAnalyzed}</div>
              <div className="text-blue-200 text-sm">Total Actions</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.reportsGenerated}</div>
              <div className="text-blue-200 text-sm">Reports</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
            <div className="flex items-center text-sm text-slate-500">
              <Zap className="h-4 w-4 mr-1" />
              AI-Powered Analysis
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="relative">
                <Link
                  to={action.href}
                  className={`group bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 block ${
                    !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    if (!action.enabled) {
                      e.preventDefault()
                    }
                  }}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      {action.enabled ? 'Get started' : 'Upload resume first'}
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                    {!action.enabled && (
                      <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                        Requires resume
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Your Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Profile Completion</span>
                <span className="text-sm font-bold text-slate-900">
                  {hasResumeData ? '75%' : '25%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: hasResumeData ? '75%' : '25%' }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${hasResumeData ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className="text-sm text-slate-600">Resume Uploaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${stats.skillsAnalyzed > 0 ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className="text-sm text-slate-600">Skills Analyzed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${stats.reportsGenerated > 0 ? 'text-green-500' : 'text-slate-300'}`} />
                  <span className="text-sm text-slate-600">Report Generated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-slate-300" />
                  <span className="text-sm text-slate-600">Goals Set</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Insights */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent activity</p>
                <p className="text-slate-400 text-xs mt-1">Upload a resume to get started</p>
              </div>
            )}
          </div>

          {/* Career Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <Star className="h-5 w-5 mr-2 text-purple-600" />
              Career Insights
            </h3>
            {hasResumeData && latestResume ? (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900">Latest Resume</p>
                  <p className="text-purple-800">{latestResume.filename}</p>
                </div>
                {latestResume.parsed_data?.analysis?.experienceLevel && (
                  <div className="p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">Experience Level</p>
                    <p className="text-purple-800">{latestResume.parsed_data.analysis.experienceLevel}</p>
                  </div>
                )}
                {latestResume.parsed_data?.skills && (
                  <div className="p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">Skills Count</p>
                    <p className="text-purple-800">
                      {Object.values(latestResume.parsed_data.skills).flat().length} skills identified
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Brain className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-700 text-sm">Upload your resume to get personalized insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star,
  CheckCircle2,
  Clock,
  Zap,
  Calendar,
  BarChart3,
  Users,
  BookOpen,
  Briefcase,
  GraduationCap,
  Upload,
  FileText,
  Brain,
  ChevronRight,
  Plus,
  Sparkles
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
  category: 'resume' | 'skills' | 'career' | 'learning' | 'engagement'
}

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  completedAt?: string
  order: number
  category: string
}

interface ProgressStats {
  profileCompletion: number
  skillsAnalyzed: number
  reportsGenerated: number
  careerMatches: number
  coursesRecommended: number
  totalAchievements: number
  unlockedAchievements: number
}

const ProgressTracker: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<ProgressStats>({
    profileCompletion: 0,
    skillsAnalyzed: 0,
    reportsGenerated: 0,
    careerMatches: 0,
    coursesRecommended: 0,
    totalAchievements: 0,
    unlockedAchievements: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadProgressData()
    }
  }, [user])

  const loadProgressData = async () => {
    if (!user) return

    try {
      // Load user data
      const [resumesResult, assessmentsResult, reportsResult] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id),
        supabase.from('assessments').select('*').eq('user_id', user.id),
        supabase.from('reports').select('*').eq('user_id', user.id)
      ])

      const resumeCount = resumesResult.data?.length || 0
      const assessmentCount = assessmentsResult.data?.length || 0
      const reportCount = reportsResult.data?.length || 0

      // Calculate profile completion
      let completionScore = 0
      if (resumeCount > 0) completionScore += 40
      if (assessmentCount > 0) completionScore += 30
      if (reportCount > 0) completionScore += 30

      // Update stats
      const newStats: ProgressStats = {
        profileCompletion: completionScore,
        skillsAnalyzed: resumeCount > 0 ? Object.values(resumesResult.data[0].parsed_data?.skills || {}).flat().length : 0,
        reportsGenerated: reportCount,
        careerMatches: resumeCount * 4, // Estimated based on analysis
        coursesRecommended: assessmentCount * 3, // Estimated
        totalAchievements: allAchievements.length,
        unlockedAchievements: 0 // Will be calculated below
      }

      // Generate achievements based on user data
      const userAchievements = generateAchievements(resumeCount, assessmentCount, reportCount, newStats)
      const userMilestones = generateMilestones(resumeCount, assessmentCount, reportCount)

      newStats.unlockedAchievements = userAchievements.filter(a => a.unlocked).length

      setStats(newStats)
      setAchievements(userAchievements)
      setMilestones(userMilestones)

    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const allAchievements: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    {
      id: 'first-upload',
      title: 'First Steps',
      description: 'Upload your first resume',
      icon: Upload,
      color: 'from-blue-500 to-cyan-500',
      category: 'resume',
      maxProgress: 1
    },
    {
      id: 'skill-explorer',
      title: 'Skill Explorer',
      description: 'Analyze 25+ skills from your resume',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      category: 'skills',
      maxProgress: 25
    },
    {
      id: 'report-generator',
      title: 'Report Generator',
      description: 'Generate your first career report',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      category: 'career',
      maxProgress: 1
    },
    {
      id: 'career-matcher',
      title: 'Career Matcher',
      description: 'Find 10+ career matches',
      icon: Briefcase,
      color: 'from-orange-500 to-red-500',
      category: 'career',
      maxProgress: 10
    },
    {
      id: 'learning-enthusiast',
      title: 'Learning Enthusiast',
      description: 'Get 5+ course recommendations',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      category: 'learning',
      maxProgress: 5
    },
    {
      id: 'profile-master',
      title: 'Profile Master',
      description: 'Complete 100% of your profile',
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      category: 'engagement',
      maxProgress: 100
    },
    {
      id: 'assessment-taker',
      title: 'Assessment Taker',
      description: 'Complete a career assessment',
      icon: Brain,
      color: 'from-cyan-500 to-blue-500',
      category: 'skills',
      maxProgress: 1
    },
    {
      id: 'multi-resume',
      title: 'Multi-Resume Pro',
      description: 'Upload and analyze 3+ resumes',
      icon: Upload,
      color: 'from-pink-500 to-rose-500',
      category: 'resume',
      maxProgress: 3
    }
  ]

  const generateAchievements = (resumeCount: number, assessmentCount: number, reportCount: number, stats: ProgressStats): Achievement[] => {
    return allAchievements.map(achievement => {
      let unlocked = false
      let progress = 0
      let unlockedAt: string | undefined

      switch (achievement.id) {
        case 'first-upload':
          unlocked = resumeCount > 0
          progress = Math.min(resumeCount, 1)
          break
        case 'skill-explorer':
          unlocked = stats.skillsAnalyzed >= 25
          progress = Math.min(stats.skillsAnalyzed, 25)
          break
        case 'report-generator':
          unlocked = reportCount > 0
          progress = Math.min(reportCount, 1)
          break
        case 'career-matcher':
          unlocked = stats.careerMatches >= 10
          progress = Math.min(stats.careerMatches, 10)
          break
        case 'learning-enthusiast':
          unlocked = stats.coursesRecommended >= 5
          progress = Math.min(stats.coursesRecommended, 5)
          break
        case 'profile-master':
          unlocked = stats.profileCompletion >= 100
          progress = stats.profileCompletion
          break
        case 'assessment-taker':
          unlocked = assessmentCount > 0
          progress = Math.min(assessmentCount, 1)
          break
        case 'multi-resume':
          unlocked = resumeCount >= 3
          progress = Math.min(resumeCount, 3)
          break
      }

      if (unlocked && !unlockedAt) {
        unlockedAt = new Date().toISOString()
      }

      return {
        ...achievement,
        unlocked,
        progress,
        unlockedAt
      }
    })
  }

  const generateMilestones = (resumeCount: number, assessmentCount: number, reportCount: number): Milestone[] => {
    const baseMilestones = [
      {
        id: 'upload-resume',
        title: 'Upload Your Resume',
        description: 'Get started by uploading your first resume for analysis',
        order: 1,
        category: 'Getting Started'
      },
      {
        id: 'review-analysis',
        title: 'Review Analysis Results',
        description: 'Examine your parsed resume data and extracted skills',
        order: 2,
        category: 'Analysis'
      },
      {
        id: 'complete-assessment',
        title: 'Complete Career Assessment',
        description: 'Take our comprehensive personality and skills assessment',
        order: 3,
        category: 'Assessment'
      },
      {
        id: 'generate-report',
        title: 'Generate Career Report',
        description: 'Create your first detailed career development report',
        order: 4,
        category: 'Reporting'
      },
      {
        id: 'explore-matches',
        title: 'Explore Career Matches',
        description: 'Review job recommendations based on your profile',
        order: 5,
        category: 'Career Planning'
      },
      {
        id: 'plan-learning',
        title: 'Plan Your Learning',
        description: 'Review skill gaps and course recommendations',
        order: 6,
        category: 'Skill Development'
      }
    ]

    return baseMilestones.map(milestone => {
      let completed = false
      let completedAt: string | undefined

      switch (milestone.id) {
        case 'upload-resume':
          completed = resumeCount > 0
          break
        case 'review-analysis':
          completed = resumeCount > 0 // Assume they've reviewed if uploaded
          break
        case 'complete-assessment':
          completed = assessmentCount > 0
          break
        case 'generate-report':
          completed = reportCount > 0
          break
        case 'explore-matches':
          completed = resumeCount > 0 // Matches are generated with resume
          break
        case 'plan-learning':
          completed = assessmentCount > 0 // Learning plans come with assessments
          break
      }

      if (completed && !completedAt) {
        completedAt = new Date().toISOString()
      }

      return {
        ...milestone,
        completed,
        completedAt
      }
    })
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories = ['all', ...new Set(achievements.map(a => a.category))]

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'all': return 'All'
      case 'resume': return 'Resume'
      case 'skills': return 'Skills'
      case 'career': return 'Career'
      case 'learning': return 'Learning'
      case 'engagement': return 'Engagement'
      default: return category
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100)
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Progress</h1>
        <p className="text-lg text-slate-600">
          Track your career development journey and unlock achievements
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.profileCompletion}%</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Profile Completion</h3>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.profileCompletion}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.skillsAnalyzed}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Skills Analyzed</h3>
          <p className="text-sm text-slate-600">Identified from your resume</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.reportsGenerated}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Reports Generated</h3>
          <p className="text-sm text-slate-600">Career development insights</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {stats.unlockedAchievements}/{stats.totalAchievements}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Achievements</h3>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage(stats.unlockedAchievements, stats.totalAchievements)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
          Career Journey Milestones
        </h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {milestone.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{milestone.order}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${
                  milestone.completed ? 'text-slate-900' : 'text-slate-600'
                }`}>
                  {milestone.title}
                </h3>
                <p className="text-sm text-slate-500">{milestone.description}</p>
                {milestone.completed && milestone.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed {new Date(milestone.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {milestone.completed && (
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <Trophy className="h-6 w-6 mr-3 text-orange-600" />
            Achievements
          </h2>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50 shadow-md'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${achievement.color} ${
                  achievement.unlocked ? 'opacity-100' : 'opacity-50'
                }`}>
                  <achievement.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium mb-1 ${
                    achievement.unlocked ? 'text-slate-900' : 'text-slate-600'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                  
                  {achievement.maxProgress && achievement.maxProgress > 1 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        <span>{Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-blue-600" />
          Recommended Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.profileCompletion < 100 && (
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h3 className="font-medium text-slate-900 mb-2">Complete Your Profile</h3>
              <p className="text-sm text-slate-600 mb-3">
                Upload a resume and complete assessments to unlock more features
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                Get Started
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
          
          {stats.reportsGenerated === 0 && (
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <h3 className="font-medium text-slate-900 mb-2">Generate Your First Report</h3>
              <p className="text-sm text-slate-600 mb-3">
                Create a comprehensive career development report
              </p>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
                Create Report
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker
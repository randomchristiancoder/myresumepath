import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Brain, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  TrendingUp,
  Award,
  BookOpen,
  ExternalLink,
  User,
  FileText,
  Upload,
  AlertCircle,
  Zap,
  Clock,
  BarChart3,
  Database,
  Save,
  Code,
  Cpu,
  Building,
  Globe,
  Shield
} from 'lucide-react'

interface SkillGap {
  skill: string
  currentLevel: number
  requiredLevel: number
  priority: 'high' | 'medium' | 'low'
  description: string
  resources: string[]
}

interface CourseRecommendation {
  id: string
  title: string
  provider: string
  duration: string
  level: string
  rating: number
  price: string
  skills: string[]
  url: string
  description: string
  category: string
}

interface ResumeAnalysis {
  parsedData: any
  aiEnhanced: boolean
  extractionQuality: string
  uploadedAt: string
  resumeId?: string
}

interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  salary: string
  match: number
  description: string
  requirements: string[]
  remote: boolean
  posted: string
}

const AnalysisPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<'check-resume' | 'results'>('check-resume')
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [personalityInsights, setPersonalityInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [totalSkillsCount, setTotalSkillsCount] = useState(0)

  useEffect(() => {
    checkResumeData()
  }, [user])

  const checkResumeData = async () => {
    if (!user) return

    try {
      // Check for stored analysis data first
      const storedAnalysis = localStorage.getItem('resumeAnalysis')
      if (storedAnalysis) {
        const analysis = JSON.parse(storedAnalysis)
        setResumeAnalysis(analysis)
        
        // Calculate total skills count
        if (analysis.parsedData?.skills) {
          const totalSkills = Object.values(analysis.parsedData.skills).flat().length
          setTotalSkillsCount(totalSkills)
        }
        
        generateAnalysisResults(analysis)
        setCurrentStep('results')
        setLoading(false)
        return
      }

      // Check database for resume
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (resumes && resumes.length > 0) {
        const latestResume = resumes[0]
        const analysis = {
          parsedData: latestResume.parsed_data,
          aiEnhanced: true,
          extractionQuality: 'High Quality',
          uploadedAt: latestResume.created_at,
          resumeId: latestResume.id
        }
        setResumeAnalysis(analysis)
        
        // Calculate total skills count
        if (latestResume.parsed_data?.skills) {
          const totalSkills = Object.values(latestResume.parsed_data.skills).flat().length
          setTotalSkillsCount(totalSkills)
        }
        
        // Store in localStorage for consistency
        localStorage.setItem('resumeAnalysis', JSON.stringify(analysis))
        generateAnalysisResults(analysis)
        setCurrentStep('results')
      }
    } catch (error) {
      console.error('Error checking resume data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysisResults = async (analysis: ResumeAnalysis) => {
    try {
      // Generate comprehensive analysis based on resume data
      const currentSkills = analysis.parsedData?.skills || {}
      const allSkills = Object.values(currentSkills).flat()
      
      const mockSkillGaps = [
        {
          skill: 'Machine Learning',
          currentLevel: allSkills.includes('Python') ? 2 : 1,
          requiredLevel: 4,
          priority: 'high' as const,
          description: 'Essential for data-driven decision making and AI integration',
          resources: ['Coursera ML Course', 'Kaggle Learn', 'Fast.ai', 'Andrew Ng Course']
        },
        {
          skill: 'Cloud Architecture',
          currentLevel: allSkills.includes('AWS') ? 3 : 2,
          requiredLevel: 5,
          priority: 'high' as const,
          description: 'Critical for scalable system design and modern infrastructure',
          resources: ['AWS Solutions Architect', 'Azure Fundamentals', 'GCP Professional', 'Cloud Design Patterns']
        },
        {
          skill: 'System Design',
          currentLevel: analysis.parsedData?.analysis?.experienceLevel?.includes('Senior') ? 4 : 3,
          requiredLevel: 5,
          priority: 'high' as const,
          description: 'Required for senior engineering roles and technical leadership',
          resources: ['System Design Interview', 'High Scalability', 'Designing Data-Intensive Applications']
        },
        {
          skill: 'DevOps',
          currentLevel: allSkills.includes('Docker') || allSkills.includes('Kubernetes') ? 3 : 2,
          requiredLevel: 4,
          priority: 'medium' as const,
          description: 'Essential for modern software delivery and operations',
          resources: ['DevOps Handbook', 'Docker Mastery', 'Kubernetes Certification', 'CI/CD Best Practices']
        },
        {
          skill: 'Leadership',
          currentLevel: 2,
          requiredLevel: 4,
          priority: 'medium' as const,
          description: 'Important for career advancement and team management',
          resources: ['Tech Lead Course', 'Management 3.0', 'The Manager\'s Path', 'Leadership in Tech']
        }
      ]

      const mockCourseRecommendations = [
        {
          id: '1',
          title: 'AWS Solutions Architect Professional',
          provider: 'AWS Training',
          duration: '40 hours',
          level: 'Advanced',
          rating: 4.8,
          price: '$300',
          skills: ['Cloud Architecture', 'AWS Services', 'System Design'],
          url: 'https://aws.amazon.com/training/',
          description: 'Master AWS cloud architecture and prepare for the Solutions Architect certification.',
          category: 'Cloud Computing'
        },
        {
          id: '2',
          title: 'Machine Learning Specialization',
          provider: 'Coursera (Stanford)',
          duration: '3 months',
          level: 'Intermediate',
          rating: 4.9,
          price: '$49/month',
          skills: ['Machine Learning', 'Python', 'Data Science'],
          url: 'https://coursera.org/specializations/machine-learning',
          description: 'Learn machine learning fundamentals from Stanford University.',
          category: 'Data Science'
        },
        {
          id: '3',
          title: 'DevOps Engineer Certification',
          provider: 'Linux Academy',
          duration: '6 weeks',
          level: 'Intermediate',
          rating: 4.7,
          price: '$199',
          skills: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD'],
          url: 'https://linuxacademy.com/',
          description: 'Comprehensive DevOps training with hands-on labs.',
          category: 'DevOps'
        },
        {
          id: '4',
          title: 'System Design Interview Prep',
          provider: 'Educative',
          duration: '20 hours',
          level: 'Advanced',
          rating: 4.6,
          price: '$79',
          skills: ['System Design', 'Architecture', 'Scalability'],
          url: 'https://educative.io/',
          description: 'Master system design concepts for technical interviews and real-world applications.',
          category: 'System Design'
        },
        {
          id: '5',
          title: 'Technical Leadership Bootcamp',
          provider: 'Pluralsight',
          duration: '15 hours',
          level: 'Intermediate',
          rating: 4.5,
          price: '$29/month',
          skills: ['Leadership', 'Management', 'Communication'],
          url: 'https://pluralsight.com/',
          description: 'Develop leadership skills for technical professionals.',
          category: 'Leadership'
        }
      ]

      // Generate job matches based on skills and preferences
      const experienceLevel = analysis.parsedData?.analysis?.experienceLevel || 'Mid-level'
      const mockJobMatches = [
        {
          id: '1',
          title: experienceLevel.includes('Senior') ? 'Principal Software Engineer' : 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          salary: experienceLevel.includes('Senior') ? '$160,000 - $220,000' : '$140,000 - $180,000',
          match: 94,
          description: 'Lead development of scalable web applications using modern technologies.',
          requirements: allSkills.slice(0, 5),
          remote: true,
          posted: '2 days ago'
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          salary: '$120,000 - $160,000',
          match: 89,
          description: 'Build end-to-end solutions for our growing platform.',
          requirements: ['JavaScript', 'Python', 'React'],
          remote: true,
          posted: '1 week ago'
        },
        {
          id: '3',
          title: 'Technical Lead',
          company: 'Innovation Labs',
          location: 'New York, NY',
          salary: '$160,000 - $200,000',
          match: 87,
          description: 'Lead a team of developers and architect technical solutions.',
          requirements: ['Leadership', 'JavaScript', 'System Design'],
          remote: false,
          posted: '3 days ago'
        },
        {
          id: '4',
          title: 'Solutions Architect',
          company: 'CloudTech',
          location: 'Seattle, WA',
          salary: '$150,000 - $190,000',
          match: 85,
          description: 'Design and implement cloud infrastructure solutions.',
          requirements: ['AWS', 'System Design', 'Architecture'],
          remote: true,
          posted: '5 days ago'
        }
      ]

      const mockPersonalityInsights = {
        careerType: 'Investigative & Enterprising',
        workStyle: 'Collaborative environment with autonomy',
        strengths: [
          'Technical problem-solving',
          'Strategic thinking',
          'Continuous learning',
          'Team collaboration'
        ],
        idealEnvironment: 'Structured teams with innovation opportunities',
        careerRecommendations: [
          'Senior Software Engineer',
          'Technical Lead',
          'Solutions Architect',
          'Engineering Manager'
        ],
        personalityTraits: {
          leadership_potential: 70,
          creativity_score: 85,
          analytical_thinking: 92,
          communication_skills: 80,
          adaptability: 85,
          teamwork: 90
        }
      }

      setSkillGaps(mockSkillGaps)
      setCourseRecommendations(mockCourseRecommendations)
      setJobMatches(mockJobMatches)
      setPersonalityInsights(mockPersonalityInsights)

    } catch (error) {
      console.error('Error generating analysis results:', error)
    }
  }

  const handleUploadResume = () => {
    navigate('/upload')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const renderSkillCategory = (title: string, skills: string[] = [], icon: React.ReactNode, color: string) => {
    if (!skills || skills.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className={`text-sm font-semibold ${color} mb-3 flex items-center`}>
          {icon}
          {title} ({skills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 ${
                title.includes('Technical') || title.includes('Programming') 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200'
                  : title.includes('Cloud')
                  ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 hover:from-cyan-200 hover:to-blue-200'
                  : title.includes('Soft')
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200'
                  : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 hover:from-orange-200 hover:to-red-200'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading skill analysis...</p>
        </div>
      </div>
    )
  }

  // Check Resume Step
  if (currentStep === 'check-resume') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <Upload className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Resume Required for Skill Analysis
          </h2>
          <p className="text-slate-600 mb-6">
            To provide personalized skill analysis and career insights, we need to analyze your resume first.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">What we'll analyze:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Skills and technical expertise</li>
                  <li>• Work experience and career progression</li>
                  <li>• Education and certifications</li>
                  <li>• Industry focus and specializations</li>
                </ul>
              </div>
            </div>
          </div>
          <button
            onClick={handleUploadResume}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Resume First
          </button>
        </div>
      </div>
    )
  }

  // Results Step
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Skill Analysis Results</h1>
        <p className="text-purple-100 text-lg">
          Based on your resume analysis, here's your comprehensive skill assessment and career development plan
        </p>
        <div className="flex items-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AI-Powered Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{totalSkillsCount} Skills Identified</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Personalized Insights</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Skills Overview */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-3 text-blue-500" />
              Skills Overview ({totalSkillsCount} skills identified)
            </h2>
            <div className="space-y-6">
              {renderSkillCategory(
                'Technical Skills', 
                resumeAnalysis?.parsedData?.skills?.technical, 
                <Code className="h-4 w-4 mr-2" />, 
                'text-blue-700'
              )}
              {renderSkillCategory(
                'Programming Languages', 
                resumeAnalysis?.parsedData?.skills?.programming, 
                <Cpu className="h-4 w-4 mr-2" />, 
                'text-purple-700'
              )}
              {renderSkillCategory(
                'Frameworks & Libraries', 
                resumeAnalysis?.parsedData?.skills?.frameworks, 
                <Building className="h-4 w-4 mr-2" />, 
                'text-orange-700'
              )}
              {renderSkillCategory(
                'Cloud Platforms', 
                resumeAnalysis?.parsedData?.skills?.cloud, 
                <Globe className="h-4 w-4 mr-2" />, 
                'text-cyan-700'
              )}
              {renderSkillCategory(
                'Databases', 
                resumeAnalysis?.parsedData?.skills?.databases, 
                <Database className="h-4 w-4 mr-2" />, 
                'text-red-700'
              )}
              {renderSkillCategory(
                'Tools & Technologies', 
                resumeAnalysis?.parsedData?.skills?.tools, 
                <Target className="h-4 w-4 mr-2" />, 
                'text-indigo-700'
              )}
            </div>
          </div>

          {/* Job Matches */}
          {jobMatches.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-green-500" />
                Top Job Matches
              </h2>
              <div className="space-y-4">
                {jobMatches.slice(0, 4).map((job, index) => (
                  <div key={job.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                        <p className="text-blue-600 font-medium">{job.company}</p>
                        <p className="text-slate-600 text-sm">{job.location} • {job.posted}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">{job.match}%</span>
                        <p className="text-sm text-slate-500">match</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-700 text-sm mb-3">{job.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="font-medium text-green-600">{job.salary}</span>
                        {job.remote && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Remote</span>
                        )}
                      </div>
                      <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                        View Details
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {skillGaps.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Target className="h-6 w-6 mr-3 text-red-500" />
                Identified Skill Gaps
              </h2>
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-slate-900">{gap.skill}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                        {gap.priority} priority
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{gap.description}</p>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Current: {gap.currentLevel}/5</span>
                          <span>Target: {gap.requiredLevel}/5</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full"
                            style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        Gap: {gap.requiredLevel - gap.currentLevel}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gap.resources.map((resource, resourceIndex) => (
                        <span key={resourceIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Recommendations */}
          {courseRecommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-blue-500" />
                Recommended Courses
              </h2>
              <div className="space-y-4">
                {courseRecommendations.slice(0, 4).map((course, index) => (
                  <div key={course.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                        <p className="text-blue-600 text-sm font-medium">{course.provider}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{course.price}</span>
                    </div>
                    
                    <p className="text-slate-700 text-sm mb-3">{course.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-3 text-sm text-slate-600">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View Course
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Summary */}
          {resumeAnalysis && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-green-600" />
                Resume Summary
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900">Analysis Quality</p>
                  <p className="text-green-800">{resumeAnalysis.extractionQuality}</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">AI Enhanced</p>
                  <p className="text-blue-800">{resumeAnalysis.aiEnhanced ? 'Yes' : 'Standard'}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900">Total Skills</p>
                  <p className="text-purple-800 font-bold text-lg">{totalSkillsCount} skills identified</p>
                </div>

                {resumeAnalysis.resumeId && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900">Database Status</p>
                    <p className="text-orange-800">Saved to Profile</p>
                  </div>
                )}
                
                {resumeAnalysis.parsedData?.personalInfo?.name && (
                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <p className="text-sm font-medium text-cyan-900">Candidate</p>
                    <p className="text-cyan-800">{resumeAnalysis.parsedData.personalInfo.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personality Insights */}
          {personalityInsights && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-3 text-purple-500" />
                Career Insights
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-900 mb-2">Career Type</h3>
                  <p className="text-purple-800 text-sm">
                    <strong>{personalityInsights.careerType}</strong><br />
                    {personalityInsights.workStyle}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">Key Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {personalityInsights.strengths?.map((strength: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Career Traits</h3>
                  <div className="space-y-2">
                    {personalityInsights.personalityTraits && Object.entries(personalityInsights.personalityTraits).map(([trait, score]: [string, any]) => (
                      <div key={trait} className="flex justify-between items-center">
                        <span className="text-sm text-green-800 capitalize">{trait.replace('_', ' ')}</span>
                        <span className="text-sm font-bold text-green-900">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Ready for the Next Step?
            </h3>
            <p className="text-slate-700 text-sm mb-4">
              Generate a comprehensive career report with detailed recommendations and action items.
            </p>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Award className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
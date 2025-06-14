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
  BarChart3
} from 'lucide-react'

interface Question {
  id: string
  question: string
  type: 'multiple-choice' | 'scale' | 'text'
  options?: string[]
  category: 'interests' | 'personality' | 'goals' | 'preferences'
}

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
  const [currentStep, setCurrentStep] = useState<'check-resume' | 'assessment' | 'results'>('check-resume')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [personalityInsights, setPersonalityInsights] = useState<any>(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

  useEffect(() => {
    checkResumeData()
  }, [user])

  const checkResumeData = async () => {
    if (!user) return

    try {
      // Check for stored analysis data
      const storedAnalysis = localStorage.getItem('resumeAnalysis')
      if (storedAnalysis) {
        const analysis = JSON.parse(storedAnalysis)
        setResumeAnalysis(analysis)
        setCurrentStep('assessment')
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
        setResumeAnalysis({
          parsedData: latestResume.parsed_data,
          aiEnhanced: true,
          extractionQuality: 'High Quality',
          uploadedAt: latestResume.created_at
        })
        setCurrentStep('assessment')
      }
    } catch (error) {
      console.error('Error checking resume data:', error)
    }
  }

  const questions: Question[] = [
    {
      id: 'work_environment',
      question: 'What type of work environment do you prefer?',
      type: 'multiple-choice',
      options: [
        'Fast-paced startup environment',
        'Structured corporate setting',
        'Remote/flexible work',
        'Collaborative team environment',
        'Independent work'
      ],
      category: 'preferences'
    },
    {
      id: 'career_motivation',
      question: 'What motivates you most in your career?',
      type: 'multiple-choice',
      options: [
        'Financial success and stability',
        'Creative expression and innovation',
        'Helping others and making impact',
        'Learning and personal growth',
        'Leadership and influence'
      ],
      category: 'goals'
    },
    {
      id: 'technical_interest',
      question: 'How interested are you in highly technical work?',
      type: 'scale',
      category: 'interests'
    },
    {
      id: 'leadership_interest',
      question: 'How interested are you in leadership and management roles?',
      type: 'scale',
      category: 'interests'
    },
    {
      id: 'risk_tolerance',
      question: 'How comfortable are you with taking risks in your career?',
      type: 'scale',
      category: 'personality'
    },
    {
      id: 'ideal_role',
      question: 'Describe your ideal role in 2-3 sentences:',
      type: 'text',
      category: 'goals'
    }
  ]

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }))

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // All questions answered, analyze results
      analyzeResults()
    }
  }

  const analyzeResults = async () => {
    setIsAnalyzing(true)

    try {
      // Get personality analysis
      const personalityResponse = await fetch(`${API_BASE_URL}/api/personality-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          responses: answers,
          resumeData: resumeAnalysis?.parsedData,
          userId: user?.id
        })
      })

      if (personalityResponse.ok) {
        const personalityData = await personalityResponse.json()
        setPersonalityInsights(personalityData.personalityInsights)
      }

      // Get skill gap analysis
      const skillGapResponse = await fetch(`${API_BASE_URL}/api/skill-gap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          currentSkills: resumeAnalysis?.parsedData?.skills || {},
          targetRole: answers.ideal_role || 'Senior Software Engineer',
          userId: user?.id
        })
      })

      if (skillGapResponse.ok) {
        const skillGapData = await skillGapResponse.json()
        setSkillGaps(skillGapData.skillGaps || [])
      }

      // Get course recommendations
      const courseResponse = await fetch(`${API_BASE_URL}/api/course-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          skillGaps: ['Machine Learning', 'Cloud Architecture', 'DevOps'],
          careerGoals: answers.ideal_role || 'Senior Software Engineer',
          currentSkills: resumeAnalysis?.parsedData?.skills || {},
          userId: user?.id
        })
      })

      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourseRecommendations(courseData.courseRecommendations || [])
      }

      // Get job matches
      const jobResponse = await fetch(`${API_BASE_URL}/api/job-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          skills: Object.values(resumeAnalysis?.parsedData?.skills || {}).flat(),
          interests: answers.career_motivation || 'Software Development',
          location: resumeAnalysis?.parsedData?.personalInfo?.location || 'Remote',
          experience: resumeAnalysis?.parsedData?.analysis?.experienceLevel || 'Mid-level',
          userId: user?.id
        })
      })

      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        setJobMatches(jobData.jobMatches || [])
      }

    } catch (error) {
      console.error('Error analyzing results:', error)
    } finally {
      setIsAnalyzing(false)
      setCurrentStep('results')
    }
  }

  const handleUploadResume = () => {
    navigate('/upload')
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <span className="text-slate-900 group-hover:text-blue-600">
                  {option}
                </span>
              </button>
            ))}
          </div>
        )
      
      case 'scale':
        return (
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Not interested</span>
              <span>Very interested</span>
            </div>
            <div className="flex justify-between space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className="flex-1 h-12 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center font-semibold"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="space-y-4">
            <textarea
              rows={4}
              className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your answer here..."
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [question.id]: e.target.value
              }))}
            />
            <button
              onClick={() => handleAnswer(answers[question.id] || '')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        )
      
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  // Check Resume Step
  if (currentStep === 'check-resume') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          {resumeAnalysis ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Resume Analysis Found
              </h2>
              <p className="text-slate-600 mb-6">
                We found your recent resume analysis. Would you like to continue with the career assessment?
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Analysis Quality:</span>
                  <span className="font-medium text-slate-900">{resumeAnalysis.extractionQuality}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-600">AI Enhanced:</span>
                  <span className={`font-medium ${resumeAnalysis.aiEnhanced ? 'text-green-600' : 'text-blue-600'}`}>
                    {resumeAnalysis.aiEnhanced ? 'Yes' : 'Standard'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-600">Uploaded:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(resumeAnalysis.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCurrentStep('assessment')}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Continue to Assessment
              </button>
            </>
          ) : (
            <>
              <Upload className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Resume Required for Analysis
              </h2>
              <p className="text-slate-600 mb-6">
                To provide personalized career insights and recommendations, we need to analyze your resume first.
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
            </>
          )}
        </div>
      </div>
    )
  }

  // Assessment Step
  if (currentStep === 'assessment') {
    if (isAnalyzing) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Analyzing Your Responses
            </h2>
            <p className="text-slate-600 mb-6">
              We're processing your answers and matching them with career opportunities...
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Analyzing personality traits</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Matching skills with market demand</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-slate-700">Generating course recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <span className="text-slate-700">Finding job matches</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Career Assessment
          </h1>
          <p className="text-lg text-slate-600">
            Help us understand your career interests and goals
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {currentQuestion.question}
          </h2>
          {renderQuestion(currentQuestion)}
        </div>
      </div>
    )
  }

  // Results Step
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Your Career Analysis Results</h1>
        <p className="text-purple-100 text-lg">
          Based on your assessment and resume analysis, here's your personalized career development plan
        </p>
        <div className="flex items-center mt-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>AI-Powered Analysis</span>
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
                {courseRecommendations.slice(0, 3).map((course, index) => (
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
                
                {resumeAnalysis.parsedData?.personalInfo?.name && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">Candidate</p>
                    <p className="text-purple-800">{resumeAnalysis.parsedData.personalInfo.name}</p>
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
                Personality Insights
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
                  <h3 className="font-medium text-green-900 mb-2">Personality Traits</h3>
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
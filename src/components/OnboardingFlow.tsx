import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  BrainCircuit, 
  Upload, 
  Target, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Globe,
  Heart,
  Star,
  Play,
  X
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

interface UserPersona {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  features: string[]
}

const OnboardingFlow: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`)
    if (!hasCompletedOnboarding && user) {
      setShowOnboarding(true)
    }
  }, [user])

  const userPersonas: UserPersona[] = [
    {
      id: 'job-seeker',
      title: 'Job Seeker',
      description: 'Looking to improve my resume and find new opportunities',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      features: ['Resume Analysis', 'Job Matching', 'Skill Gap Analysis', 'Interview Prep']
    },
    {
      id: 'student',
      title: 'Student/Graduate',
      description: 'Preparing for the workforce and exploring career paths',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-500',
      features: ['Career Exploration', 'Skill Building', 'Industry Insights', 'Entry-level Jobs']
    },
    {
      id: 'career-coach',
      title: 'Career Coach',
      description: 'Helping clients with career development and guidance',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      features: ['Client Management', 'Bulk Analysis', 'Progress Tracking', 'Reporting Tools']
    },
    {
      id: 'hr-professional',
      title: 'HR Professional',
      description: 'Managing talent pipelines and internal mobility',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      features: ['Talent Assessment', 'Team Analytics', 'Skill Mapping', 'Training Plans']
    }
  ]

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to My Resume Path',
      description: 'Your AI-powered career development platform',
      icon: BrainCircuit,
      content: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <BrainCircuit className="h-16 w-16 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Transform Your Career Journey
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover your potential with AI-powered resume analysis, personalized career insights, 
              and actionable recommendations to accelerate your professional growth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">Smart Analysis</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">Skill Insights</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">Career Matching</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-900">Detailed Reports</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'persona',
      title: 'Tell Us About Yourself',
      description: 'Help us personalize your experience',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              What Best Describes You?
            </h2>
            <p className="text-slate-600">
              We'll customize your experience based on your role and goals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPersonas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPersona === persona.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${persona.color}`}>
                    <persona.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{persona.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{persona.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Platform Features',
      description: 'Discover what you can accomplish',
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Powerful Features at Your Fingertips
            </h2>
            <p className="text-slate-600">
              Everything you need for career success in one platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">AI Resume Analysis</h3>
              <p className="text-sm text-slate-600">
                Advanced parsing extracts skills, experience, and insights from your resume
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Skill Gap Analysis</h3>
              <p className="text-sm text-slate-600">
                Identify missing skills and get personalized learning recommendations
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Career Matching</h3>
              <p className="text-sm text-slate-600">
                Find jobs that match your skills and career aspirations
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Detailed Reports</h3>
              <p className="text-sm text-slate-600">
                Generate comprehensive PDF reports with actionable insights
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-cyan-100 rounded-lg w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-slate-600">
                Monitor your career development journey with interactive dashboards
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-3 bg-pink-100 rounded-lg w-fit mb-4">
                <Shield className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Privacy & Security</h3>
              <p className="text-sm text-slate-600">
                Your data is encrypted and secure with full control over privacy
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Your data, your control',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Your Privacy is Our Priority
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We're committed to protecting your personal information and giving you complete control over your data
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Data Ownership</h3>
              </div>
              <p className="text-green-800 text-sm">
                You retain full ownership of your data with options to export or delete at any time
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Secure Storage</h3>
              </div>
              <p className="text-blue-800 text-sm">
                All data is encrypted in transit and at rest using industry-standard security
              </p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Transparent Policies</h3>
              </div>
              <p className="text-purple-800 text-sm">
                Clear, easy-to-understand privacy policies with no hidden terms
              </p>
            </div>
            <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900">User Control</h3>
              </div>
              <p className="text-orange-800 text-sm">
                Granular privacy controls let you decide what data to share and with whom
              </p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">GDPR & CCPA Compliant</p>
                <p className="text-xs text-slate-600">
                  We comply with international privacy regulations and data protection standards
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Get Started',
      description: 'Your journey begins now',
      icon: Star,
      content: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <Star className="h-16 w-16 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              Welcome to My Resume Path! Start by uploading your resume to get personalized 
              insights and recommendations tailored to your career goals.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-3">Quick Start Guide:</h3>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm text-slate-700">Upload your resume (PDF, DOCX, or TXT)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm text-slate-700">Review your AI-powered analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm text-slate-700">Explore skill gaps and career matches</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                <span className="text-sm text-slate-700">Generate detailed reports and action plans</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save onboarding completion and persona
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
      if (selectedPersona) {
        localStorage.setItem(`user_persona_${user.id}`, selectedPersona)
      }
    }
    setShowOnboarding(false)
    navigate('/upload')
  }

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
    }
    setShowOnboarding(false)
    navigate('/dashboard')
  }

  if (!showOnboarding) return null

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const canProceed = currentStep !== 1 || selectedPersona !== null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <currentStepData.icon className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">{currentStepData.title}</h1>
                <p className="text-blue-100 text-sm">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            Skip for now
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
            
            {isLastStep ? (
              <button
                onClick={handleComplete}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Your Journey
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow
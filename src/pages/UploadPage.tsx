import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Eye,
  Brain,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Award,
  Code,
  Globe,
  Briefcase,
  GraduationCap,
  Star,
  Target,
  Zap,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Clock,
  Database,
  Cpu
} from 'lucide-react'

interface ParsedResume {
  personalInfo: {
    name?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    website?: string
    github?: string
  }
  summary?: string
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
    achievements?: string[]
    technologies?: string[]
    responsibilities?: string[]
  }>
  education: Array<{
    degree: string
    institution: string
    graduationDate: string
    field?: string
    gpa?: string
  }>
  skills: {
    technical?: string[]
    programming?: string[]
    frameworks?: string[]
    databases?: string[]
    cloud?: string[]
    tools?: string[]
    soft?: string[]
  }
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies?: string[]
    url?: string
    github?: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  awards: Array<{
    name: string
    issuer: string
    date: string
    description?: string
  }>
  volunteerWork: Array<{
    organization: string
    role: string
    description: string
    startDate?: string
    endDate?: string
  }>
  additionalSections?: {
    interests?: string[]
    hobbies?: string[]
    references?: string
  }
  analysis?: {
    experienceLevel: string
    careerProgression: string
    industryFocus: string[]
    keyStrengths: string[]
    leadershipExperience: boolean
    remoteWorkExperience: boolean
    internationalExperience: boolean
  }
}

const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [aiEnhanced, setAiEnhanced] = useState(false)
  const [extractionQuality, setExtractionQuality] = useState<string>('')
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'offline'>('checking')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      setShowPreview(false)
      setParsedData(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Server health check on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(3000)
        })
        if (response.ok) {
          setServerStatus('connected')
        } else {
          setServerStatus('offline')
        }
      } catch (error) {
        setServerStatus('offline')
      }
    }
    
    checkServer()
  }, [])

  const handleAnalyze = async () => {
    if (!uploadedFile || !user) return

    setIsUploading(true)
    setParsing(true)
    setError(null)

    try {
      // Try both HTTP and HTTPS endpoints
      const serverUrls = ['http://localhost:3001', 'https://localhost:3001']
      let uploadSuccess = false
      let result = null
      let lastError = null

      for (const serverUrl of serverUrls) {
        try {
          const formData = new FormData()
          formData.append('resume', uploadedFile)
          formData.append('userId', user.id)

          const response = await fetch(`${serverUrl}/api/upload-resume`, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            signal: AbortSignal.timeout(30000) // 30 second timeout
          })

          if (response.ok) {
            result = await response.json()
            uploadSuccess = true
            setServerStatus('connected')
            break
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            lastError = new Error(errorData.error || `Upload failed with status ${response.status}`)
          }
        } catch (fetchError: any) {
          lastError = fetchError
          console.log(`Failed to connect to ${serverUrl}:`, fetchError.message)
          continue
        }
      }

      if (!uploadSuccess || !result) {
        setServerStatus('offline')
        throw lastError || new Error('Unable to connect to server')
      }

      if (!result.success || !result.parsedData) {
        throw new Error('Invalid response from server')
      }
      
      setParsedData(result.parsedData)
      setAiEnhanced(result.aiEnhanced || false)
      setExtractionQuality(result.extractionQuality || 'Standard')
      setShowPreview(true)

      // Store the analysis data in localStorage for the analysis page
      localStorage.setItem('resumeAnalysis', JSON.stringify({
        parsedData: result.parsedData,
        aiEnhanced: result.aiEnhanced,
        extractionQuality: result.extractionQuality,
        uploadedAt: new Date().toISOString()
      }))

    } catch (err: any) {
      console.error('Upload error:', err)
      setServerStatus('offline')
      
      let errorMessage = 'Unable to analyze resume. Please try again.'
      
      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.'
      } else if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to the analysis server. Please ensure the backend server is running on port 3001.'
      } else if (err.message?.includes('SSL') || err.message?.includes('certificate')) {
        errorMessage = 'SSL certificate error. Please visit https://localhost:3001/api/health in a new tab and accept the security warning, then try again.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsUploading(false)
      setParsing(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setParsedData(null)
    setShowPreview(false)
    setError(null)
    setAiEnhanced(false)
    setExtractionQuality('')
  }

  const handleProceedToAnalysis = () => {
    navigate('/analysis')
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Upload Your Resume
        </h1>
        <p className="text-lg text-slate-600">
          Upload your resume to get comprehensive AI-powered career insights and recommendations
        </p>
      </div>

      {/* Server Status Indicator */}
      <div className={`rounded-lg p-4 border ${
        serverStatus === 'offline' 
          ? 'bg-red-50 border-red-200' 
          : serverStatus === 'connected'
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              serverStatus === 'offline' 
                ? 'bg-red-500' 
                : serverStatus === 'connected'
                ? 'bg-green-500'
                : 'bg-blue-500 animate-pulse'
            }`}></div>
            <span className={`text-sm font-medium ${
              serverStatus === 'offline' 
                ? 'text-red-800' 
                : serverStatus === 'connected'
                ? 'text-green-800'
                : 'text-blue-800'
            }`}>
              {serverStatus === 'checking' 
                ? 'Checking server connection...'
                : serverStatus === 'offline' 
                ? 'Server Offline - Please start the backend server'
                : 'Connected to analysis server'
              }
            </span>
          </div>
          {serverStatus === 'offline' && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry Connection
            </button>
          )}
        </div>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : uploadedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploadedFile ? (
                <div className="space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {uploadedFile.name}
                    </p>
                    <p className="text-slate-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type || 'Unknown type'}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                      className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-16 w-16 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xl font-semibold text-slate-900 mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                    </p>
                    <p className="text-slate-600">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Supports TXT, PDF, and DOCX files (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Analysis Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  
                  {/* Server startup instructions */}
                  {error.includes('backend server') && (
                    <div className="mt-3 p-3 bg-red-100 rounded text-sm text-red-800">
                      <strong>To start the backend server:</strong><br />
                      1. Open a terminal in your project directory<br />
                      2. Run: <code className="bg-red-200 px-1 rounded">npm run server</code><br />
                      3. Wait for "Server running" message<br />
                      4. Return here and try uploading again
                    </div>
                  )}

                  {/* SSL certificate help */}
                  {error.includes('SSL certificate') && (
                    <div className="mt-3 p-3 bg-red-100 rounded text-sm text-red-800">
                      <strong>SSL Certificate Issue:</strong><br />
                      <a
                        href="https://localhost:3001/api/health"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors mt-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Trust Certificate
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadedFile && serverStatus === 'connected' && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isUploading || isParsing}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isParsing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-3" />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Processing Steps */}
          {(isUploading || isParsing) && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 text-center">
                Processing Your Resume
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isUploading ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <span className={`font-medium ${isUploading ? 'text-blue-600' : 'text-green-600'}`}>
                    Uploading and extracting content...
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isParsing ? 'bg-blue-100' : !isUploading ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {isParsing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : !isUploading ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={`font-medium ${
                    isParsing ? 'text-blue-600' : !isUploading ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    Parsing resume structure and content...
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100">
                    <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                  </div>
                  <span className="font-medium text-slate-400">
                    Generating insights and recommendations...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Comprehensive Resume Preview */
        <div className="space-y-8">
          {/* Analysis Quality Banner */}
          <div className={`rounded-2xl p-6 border ${
            aiEnhanced 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {aiEnhanced ? (
                  <Zap className="h-6 w-6 text-green-600" />
                ) : (
                  <Brain className="h-6 w-6 text-blue-600" />
                )}
                <div>
                  <h3 className={`font-semibold ${aiEnhanced ? 'text-green-900' : 'text-blue-900'}`}>
                    {extractionQuality} Analysis Complete
                  </h3>
                  <p className={`text-sm ${aiEnhanced ? 'text-green-700' : 'text-blue-700'}`}>
                    {aiEnhanced 
                      ? 'Your resume was analyzed using advanced parsing for comprehensive data extraction'
                      : 'Your resume was processed using standard extraction methods'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parsedData?.personalInfo.name && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">Full Name</p>
                        <p className="text-slate-900 font-semibold">{parsedData.personalInfo.name}</p>
                      </div>
                    </div>
                  )}
                  {parsedData?.personalInfo.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">Email</p>
                        <p className="text-slate-900">{parsedData.personalInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {parsedData?.personalInfo.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">Phone</p>
                        <p className="text-slate-900">{parsedData.personalInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {parsedData?.personalInfo.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">Location</p>
                        <p className="text-slate-900">{parsedData.personalInfo.location}</p>
                      </div>
                    </div>
                  )}
                  {parsedData?.personalInfo.linkedin && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">LinkedIn</p>
                        <a href={parsedData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-700 transition-colors">
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  {parsedData?.personalInfo.github && (
                    <div className="flex items-center space-x-3">
                      <Code className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">GitHub</p>
                        <a href={parsedData.personalInfo.github} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-700 transition-colors">
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {parsedData?.summary && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-purple-600" />
                    Professional Summary
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{parsedData.summary}</p>
                </div>
              )}

              {/* Experience */}
              {parsedData?.experience && parsedData.experience.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                    <Briefcase className="h-6 w-6 mr-3 text-orange-600" />
                    Professional Experience
                  </h3>
                  <div className="space-y-6">
                    {parsedData.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-orange-200 pl-6 pb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{exp.title}</h4>
                          <span className="text-sm text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-blue-600 font-medium mb-3">{exp.company}</p>
                        {exp.description && (
                          <p className="text-slate-700 mb-3">{exp.description}</p>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-slate-600 mb-2">Key Achievements:</p>
                            <ul className="space-y-1">
                              {exp.achievements.map((achievement, achIndex) => (
                                <li key={achIndex} className="text-slate-700 text-sm flex items-start">
                                  <span className="text-green-500 mr-2 mt-1">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedData?.education && parsedData.education.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                    <GraduationCap className="h-6 w-6 mr-3 text-indigo-600" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {parsedData.education.map((edu, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                        <p className="text-indigo-600 font-medium">{edu.institution}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-slate-600">{edu.graduationDate}</span>
                          {edu.gpa && (
                            <span className="text-sm text-slate-500">GPA: {edu.gpa}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Analysis */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
                  Skills Analysis
                </h3>
                <div className="space-y-6">
                  {renderSkillCategory(
                    'Technical Skills', 
                    parsedData?.skills.technical, 
                    <Code className="h-4 w-4 mr-2" />, 
                    'text-blue-700'
                  )}
                  {renderSkillCategory(
                    'Programming Languages', 
                    parsedData?.skills.programming, 
                    <Cpu className="h-4 w-4 mr-2" />, 
                    'text-purple-700'
                  )}
                  {renderSkillCategory(
                    'Frameworks & Libraries', 
                    parsedData?.skills.frameworks, 
                    <Building className="h-4 w-4 mr-2" />, 
                    'text-orange-700'
                  )}
                  {renderSkillCategory(
                    'Cloud Platforms', 
                    parsedData?.skills.cloud, 
                    <Globe className="h-4 w-4 mr-2" />, 
                    'text-cyan-700'
                  )}
                  {renderSkillCategory(
                    'Databases', 
                    parsedData?.skills.databases, 
                    <Database className="h-4 w-4 mr-2" />, 
                    'text-red-700'
                  )}
                  {renderSkillCategory(
                    'Tools & Technologies', 
                    parsedData?.skills.tools, 
                    <Target className="h-4 w-4 mr-2" />, 
                    'text-indigo-700'
                  )}
                  {renderSkillCategory(
                    'Soft Skills', 
                    parsedData?.skills.soft, 
                    <Star className="h-4 w-4 mr-2" />, 
                    'text-green-700'
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Extraction Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Analysis Summary
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900">Extraction Quality</p>
                    <p className="text-purple-800">{extractionQuality}</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">AI Enhanced</p>
                    <p className="text-blue-800">{aiEnhanced ? 'Yes' : 'Standard'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                      <p className="text-lg font-bold text-green-900">{parsedData?.experience?.length || 0}</p>
                      <p className="text-xs text-green-700">Experience</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                      <p className="text-lg font-bold text-orange-900">
                        {Object.values(parsedData?.skills || {}).flat().length || 0}
                      </p>
                      <p className="text-xs text-orange-700">Skills</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Analysis */}
              {parsedData?.analysis && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Career Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-900">Experience Level</p>
                      <p className="text-green-800">{parsedData.analysis.experienceLevel}</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">Career Progression</p>
                      <p className="text-blue-800 text-sm">{parsedData.analysis.careerProgression}</p>
                    </div>
                    
                    {parsedData.analysis.keyStrengths && parsedData.analysis.keyStrengths.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-900">Key Strengths</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedData.analysis.keyStrengths.map((strength, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border ${
                        parsedData.analysis.leadershipExperience 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <p className="text-xs font-medium text-slate-600">Leadership</p>
                        <p className={`text-sm ${
                          parsedData.analysis.leadershipExperience ? 'text-green-800' : 'text-slate-600'
                        }`}>
                          {parsedData.analysis.leadershipExperience ? 'Yes' : 'No'}
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-lg border ${
                        parsedData.analysis.remoteWorkExperience 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <p className="text-xs font-medium text-slate-600">Remote Work</p>
                        <p className={`text-sm ${
                          parsedData.analysis.remoteWorkExperience ? 'text-blue-800' : 'text-slate-600'
                        }`}>
                          {parsedData.analysis.remoteWorkExperience ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  What's Next?
                </h3>
                <p className="text-slate-700 mb-4 text-sm">
                  Your resume has been successfully analyzed! Ready to take the next step in your career journey?
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={handleProceedToAnalysis}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Continue to Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadPage
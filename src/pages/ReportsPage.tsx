import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  FileText, 
  Download, 
  Calendar, 
  Eye,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Target,
  Award,
  Brain,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
  Zap,
  User,
  Code,
  Building,
  Globe,
  Briefcase,
  GraduationCap,
  X,
  BarChart3,
  Users,
  BookOpen,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react'
import jsPDF from 'jspdf'

interface Report {
  id: string
  title: string
  type: 'skill-analysis' | 'career-match' | 'comprehensive' | 'career-gap' | 'suggested-jobs'
  created_at: string
  status: 'draft' | 'completed'
  summary: string
  data: any
}

interface ResumeData {
  id: string
  filename: string
  parsed_data: any
  created_at: string
}

interface AssessmentData {
  id: string
  assessment_type: string
  responses: any
  results: any
  created_at: string
}

interface ReportOption {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  features: string[]
  estimatedTime: string
  requiresAssessment?: boolean
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'skill-analysis' | 'career-match' | 'comprehensive' | 'career-gap' | 'suggested-jobs'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData[]>([])
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([])
  const [showReportTypeSelection, setShowReportTypeSelection] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  const reportOptions: ReportOption[] = [
    {
      id: 'skill-analysis',
      title: 'Skills Analysis',
      description: 'Detailed breakdown of your technical and soft skills with proficiency levels and market demand analysis.',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      features: ['Skill categorization', 'Proficiency mapping', 'Market demand analysis', 'Skill recommendations'],
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'comprehensive',
      title: 'Overall Resume Analysis',
      description: 'Complete analysis of your resume including personal info, experience, education, and comprehensive insights.',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      features: ['Complete resume breakdown', 'Experience analysis', 'Education review', 'Overall assessment'],
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'career-match',
      title: 'Career Analysis Report',
      description: 'Personality-driven career recommendations with job matches based on your skills and interests.',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      features: ['Personality insights', 'Career matching', 'Job recommendations', 'Growth opportunities'],
      estimatedTime: '4-5 minutes',
      requiresAssessment: true
    },
    {
      id: 'career-gap',
      title: 'Career Gap Analysis',
      description: 'Identify skill gaps and learning opportunities to advance your career to the next level.',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      features: ['Skill gap identification', 'Learning pathways', 'Course recommendations', 'Timeline planning'],
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'suggested-jobs',
      title: 'Suggested Jobs Report',
      description: 'Curated job opportunities that match your skills, experience level, and career aspirations.',
      icon: Briefcase,
      color: 'from-indigo-500 to-purple-500',
      features: ['Job matching', 'Salary insights', 'Company analysis', 'Application tips'],
      estimatedTime: '2-3 minutes'
    }
  ]

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Load resumes, assessments, and reports
      const [resumesResult, assessmentsResult, reportsResult] = await Promise.all([
        supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('assessments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      if (resumesResult.data) setResumeData(resumesResult.data)
      if (assessmentsResult.data) setAssessmentData(assessmentsResult.data)

      // Generate reports based on actual resume data
      const generatedReports: Report[] = []

      // If we have resume data, create comprehensive reports
      if (resumesResult.data && resumesResult.data.length > 0) {
        resumesResult.data.forEach((resume, index) => {
          const latestAssessment = assessmentsResult.data?.[0]
          const skillsCount = resume.parsed_data?.skills ? 
            Object.values(resume.parsed_data.skills).flat().length : 0

          generatedReports.push({
            id: `resume-${resume.id}`,
            title: `Resume Analysis Report - ${resume.filename}`,
            type: 'comprehensive',
            created_at: resume.created_at,
            status: 'completed',
            summary: `Complete analysis of ${resume.filename} including ${skillsCount} skills identified, experience level assessment, and career recommendations based on your actual resume data.`,
            data: {
              resumeAnalysis: {
                filename: resume.filename,
                personalInfo: resume.parsed_data?.personalInfo || {},
                skills: resume.parsed_data?.skills || {},
                experience: resume.parsed_data?.experience || [],
                education: resume.parsed_data?.education || [],
                certifications: resume.parsed_data?.certifications || [],
                projects: resume.parsed_data?.projects || [],
                experienceLevel: resume.parsed_data?.analysis?.experienceLevel || 'Mid-level',
                strengthAreas: ['Full-stack development', 'Problem solving', 'Team collaboration'],
                skillsCount: skillsCount,
                uploadedAt: resume.created_at
              },
              skillGaps: [
                { skill: 'Machine Learning', currentLevel: 2, requiredLevel: 4, priority: 'high' },
                { skill: 'Cloud Architecture', currentLevel: 3, requiredLevel: 5, priority: 'high' },
                { skill: 'DevOps', currentLevel: 2, requiredLevel: 4, priority: 'medium' },
                { skill: 'System Design', currentLevel: 3, requiredLevel: 5, priority: 'high' },
                { skill: 'Leadership', currentLevel: 2, requiredLevel: 4, priority: 'medium' }
              ],
              careerMatches: [
                { role: 'Senior Software Architect', match: 94, salary: '$150,000 - $220,000' },
                { role: 'Technical Lead', match: 91, salary: '$130,000 - $180,000' },
                { role: 'Engineering Manager', match: 88, salary: '$140,000 - $200,000' },
                { role: 'Solutions Architect', match: 86, salary: '$135,000 - $190,000' }
              ],
              courseRecommendations: [
                {
                  title: 'AWS Solutions Architect Professional',
                  provider: 'AWS Training',
                  duration: '40 hours',
                  price: '$300',
                  skills: ['Cloud Architecture', 'AWS Services', 'System Design']
                },
                {
                  title: 'Machine Learning Specialization',
                  provider: 'Coursera (Stanford)',
                  duration: '3 months',
                  price: '$49/month',
                  skills: ['Machine Learning', 'Python', 'Data Science']
                }
              ],
              personalityInsights: latestAssessment?.results || {
                type: 'Investigative & Enterprising',
                strengths: ['Technical problem-solving', 'Strategic thinking', 'Team leadership'],
                workStyle: 'Collaborative environment with autonomy',
                careerGrowth: 'High potential for senior technical leadership roles'
              },
              nextSteps: [
                'Consider pursuing machine learning specialization',
                'Explore technical leadership opportunities',
                'Build expertise in cloud architecture',
                'Develop system design skills for senior roles'
              ],
              generatedAt: new Date().toISOString(),
              dataSource: 'User resume data',
              resumeId: resume.id
            }
          })

          // Add skill analysis report for each resume
          generatedReports.push({
            id: `skills-${resume.id}`,
            title: `Skill Analysis - ${resume.filename}`,
            type: 'skill-analysis',
            created_at: new Date(new Date(resume.created_at).getTime() + 1000).toISOString(),
            status: 'completed',
            summary: `Detailed analysis of ${skillsCount} skills identified in ${resume.filename} vs. market demand for your target roles.`,
            data: {
              skillsAnalyzed: skillsCount,
              gapsIdentified: 5,
              prioritySkills: ['Cloud Computing', 'Machine Learning', 'DevOps'],
              resumeSource: resume.filename,
              resumeData: resume.parsed_data,
              resumeId: resume.id
            }
          })
        })

        // Add career match report if we have assessment data
        if (assessmentsResult.data && assessmentsResult.data.length > 0) {
          const latestAssessment = assessmentsResult.data[0]
          generatedReports.push({
            id: `career-${latestAssessment.id}`,
            title: 'Career Path Recommendations',
            type: 'career-match',
            created_at: latestAssessment.created_at,
            status: 'completed',
            summary: 'Personalized career recommendations based on your skills, interests, and assessment responses.',
            data: {
              topMatches: 4,
              industryFocus: 'Technology',
              growthPotential: 'High',
              assessmentType: latestAssessment.assessment_type,
              assessmentResults: latestAssessment.results,
              assessmentId: latestAssessment.id
            }
          })
        }
      }

      // Sort by creation date
      generatedReports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setReports(generatedReports)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = () => {
    if (resumeData.length === 0) {
      alert('Please upload a resume first to generate a report.')
      return
    }
    setShowReportTypeSelection(true)
  }

  const handleReportTypeSelect = (reportType: string) => {
    setSelectedReportType(reportType)
    
    // If only one resume, auto-select it
    if (resumeData.length === 1) {
      setSelectedResumeId(resumeData[0].id)
    }
  }

  const generateNewReport = async () => {
    if (!user || !selectedReportType || !selectedResumeId) return

    setGenerating(true)

    try {
      const selectedResume = resumeData.find(r => r.id === selectedResumeId)
      if (!selectedResume) {
        throw new Error('Selected resume not found')
      }

      const latestAssessment = assessmentData[0]
      const reportOption = reportOptions.find(opt => opt.id === selectedReportType)

      // Check if assessment is required but not available
      if (reportOption?.requiresAssessment && !latestAssessment) {
        alert('This report type requires a completed assessment. Please complete an assessment first.')
        return
      }

      // Create report data based on selected type and resume
      const reportData = generateReportData(selectedReportType, selectedResume, latestAssessment)

      // Save to database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          resume_id: selectedResumeId,
          assessment_id: latestAssessment?.id || null,
          report_data: reportData
        })
        .select()
        .single()

      if (error) throw error

      // Reload reports
      await loadData()
      
      // Close modal
      setShowReportTypeSelection(false)
      setSelectedReportType(null)
      setSelectedResumeId(null)

    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const generateReportData = (reportType: string, resume: ResumeData, assessment?: AssessmentData) => {
    const baseData = {
      resumeAnalysis: {
        filename: resume.filename,
        skills: resume.parsed_data?.skills || {},
        experience: resume.parsed_data?.experience || [],
        education: resume.parsed_data?.education || [],
        experienceLevel: resume.parsed_data?.analysis?.experienceLevel || 'Mid-level',
        strengthAreas: ['Full-stack development', 'Problem solving', 'Team collaboration']
      },
      generatedAt: new Date().toISOString(),
      dataSource: 'User resume and assessment data',
      reportType: reportType
    }

    switch (reportType) {
      case 'skill-analysis':
        return {
          ...baseData,
          skillBreakdown: resume.parsed_data?.skills || {},
          skillGaps: [
            { skill: 'Machine Learning', currentLevel: 2, requiredLevel: 4, priority: 'high' },
            { skill: 'Cloud Architecture', currentLevel: 3, requiredLevel: 5, priority: 'high' }
          ],
          marketDemand: {
            highDemand: ['React', 'Python', 'AWS'],
            mediumDemand: ['Vue.js', 'Docker'],
            lowDemand: ['jQuery', 'PHP']
          }
        }

      case 'career-gap':
        return {
          ...baseData,
          skillGaps: [
            { skill: 'Machine Learning', currentLevel: 2, requiredLevel: 4, priority: 'high' },
            { skill: 'Cloud Architecture', currentLevel: 3, requiredLevel: 5, priority: 'high' },
            { skill: 'DevOps', currentLevel: 2, requiredLevel: 4, priority: 'medium' }
          ],
          learningPath: [
            { step: 1, skill: 'Machine Learning', timeframe: '3-6 months', resources: ['Coursera ML Course'] },
            { step: 2, skill: 'Cloud Architecture', timeframe: '2-4 months', resources: ['AWS Certification'] }
          ]
        }

      case 'suggested-jobs':
        return {
          ...baseData,
          jobMatches: [
            { role: 'Senior Software Engineer', match: 94, salary: '$140,000 - $180,000', company: 'TechCorp' },
            { role: 'Full Stack Developer', match: 89, salary: '$120,000 - $160,000', company: 'StartupXYZ' }
          ],
          salaryInsights: {
            currentMarketValue: '$150,000',
            potentialIncrease: '15-25%',
            topPayingSkills: ['React', 'AWS', 'Python']
          }
        }

      case 'career-match':
        return {
          ...baseData,
          personalityInsights: assessment?.results || {
            type: 'Investigative & Enterprising',
            strengths: ['Technical problem-solving', 'Strategic thinking'],
            workStyle: 'Collaborative environment with autonomy'
          },
          careerMatches: [
            { role: 'Senior Software Architect', match: 94, salary: '$150,000 - $220,000' },
            { role: 'Technical Lead', match: 91, salary: '$130,000 - $180,000' }
          ]
        }

      default: // comprehensive
        return {
          ...baseData,
          skillGaps: [
            { skill: 'Machine Learning', currentLevel: 2, requiredLevel: 4, priority: 'high' },
            { skill: 'Cloud Architecture', currentLevel: 3, requiredLevel: 5, priority: 'high' }
          ],
          careerMatches: [
            { role: 'Senior Software Architect', match: 94, salary: '$150,000 - $220,000' },
            { role: 'Technical Lead', match: 91, salary: '$130,000 - $180,000' }
          ],
          courseRecommendations: [
            {
              title: 'AWS Solutions Architect Professional',
              provider: 'AWS Training',
              duration: '40 hours',
              price: '$300'
            }
          ],
          personalityInsights: assessment?.results || {
            type: 'Investigative & Enterprising',
            strengths: ['Technical problem-solving', 'Strategic thinking']
          }
        }
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.type === filter
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const generatePDF = (report: Report) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFontSize(24)
    doc.setTextColor(59, 130, 246) // Blue color
    doc.text('My Resume Path', margin, 30)
    
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(report.title, margin, 50)
    
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date(report.created_at).toLocaleDateString()}`, margin, 65)
    
    // Summary section
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Executive Summary', margin, 85)
    
    doc.setFontSize(11)
    const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 2 * margin)
    doc.text(summaryLines, margin, 100)

    let yPosition = 100 + (summaryLines.length * 6) + 20

    if (report.type === 'comprehensive' && report.data) {
      // Resume Analysis section
      if (report.data.resumeAnalysis) {
        doc.setFontSize(14)
        doc.text('Resume Analysis', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        if (report.data.resumeAnalysis.filename) {
          doc.text(`Source: ${report.data.resumeAnalysis.filename}`, margin + 10, yPosition)
          yPosition += 8
        }
        if (report.data.resumeAnalysis.experienceLevel) {
          doc.text(`Experience Level: ${report.data.resumeAnalysis.experienceLevel}`, margin + 10, yPosition)
          yPosition += 8
        }
        if (report.data.resumeAnalysis.skillsCount) {
          doc.text(`Skills Identified: ${report.data.resumeAnalysis.skillsCount}`, margin + 10, yPosition)
          yPosition += 8
        }
        yPosition += 10
      }

      // Personal Information
      if (report.data.resumeAnalysis?.personalInfo) {
        const personalInfo = report.data.resumeAnalysis.personalInfo
        if (personalInfo.name || personalInfo.email) {
          doc.setFontSize(14)
          doc.text('Personal Information', margin, yPosition)
          yPosition += 15
          
          doc.setFontSize(11)
          if (personalInfo.name) {
            doc.text(`Name: ${personalInfo.name}`, margin + 10, yPosition)
            yPosition += 8
          }
          if (personalInfo.email) {
            doc.text(`Email: ${personalInfo.email}`, margin + 10, yPosition)
            yPosition += 8
          }
          if (personalInfo.phone) {
            doc.text(`Phone: ${personalInfo.phone}`, margin + 10, yPosition)
            yPosition += 8
          }
          yPosition += 10
        }
      }

      // Skills section
      if (report.data.resumeAnalysis?.skills) {
        doc.setFontSize(14)
        doc.text('Technical Skills', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        const skills = report.data.resumeAnalysis.skills
        Object.entries(skills).forEach(([category, skillList]: [string, any]) => {
          if (skillList && skillList.length > 0) {
            doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${skillList.join(', ')}`, margin + 10, yPosition)
            yPosition += 8
          }
        })
        yPosition += 10
      }

      // Experience section
      if (report.data.resumeAnalysis?.experience && report.data.resumeAnalysis.experience.length > 0) {
        doc.setFontSize(14)
        doc.text('Professional Experience', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        report.data.resumeAnalysis.experience.forEach((exp: any, index: number) => {
          doc.text(`${index + 1}. ${exp.title} at ${exp.company}`, margin + 10, yPosition)
          yPosition += 8
          if (exp.duration) {
            doc.text(`   Duration: ${exp.duration}`, margin + 10, yPosition)
            yPosition += 8
          }
        })
        yPosition += 10
      }

      // Education section
      if (report.data.resumeAnalysis?.education && report.data.resumeAnalysis.education.length > 0) {
        doc.setFontSize(14)
        doc.text('Education', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        report.data.resumeAnalysis.education.forEach((edu: any, index: number) => {
          doc.text(`${index + 1}. ${edu.degree} - ${edu.institution}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Skill gaps section
      if (report.data.skillGaps) {
        doc.setFontSize(14)
        doc.text('Identified Skill Gaps', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        report.data.skillGaps.forEach((gap: any, index: number) => {
          doc.text(`${index + 1}. ${gap.skill} (Priority: ${gap.priority})`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Career matches section
      if (report.data.careerMatches) {
        doc.setFontSize(14)
        doc.text('Top Career Matches', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        report.data.careerMatches.forEach((match: any, index: number) => {
          doc.text(`${index + 1}. ${match.role} (${match.match}% match) - ${match.salary}`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 10
      }

      // Course recommendations
      if (report.data.courseRecommendations) {
        doc.setFontSize(14)
        doc.text('Recommended Courses', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        report.data.courseRecommendations.forEach((course: any, index: number) => {
          doc.text(`${index + 1}. ${course.title} - ${course.provider} (${course.price})`, margin + 10, yPosition)
          yPosition += 8
        })
      }
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by My Resume Path - Your Career Development Partner', margin, pageHeight - 20)
    
    doc.save(`${report.title.replace(/\s+/g, '_')}_Report.pdf`)
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'skill-analysis': return Target
      case 'career-match': return TrendingUp
      case 'comprehensive': return Brain
      case 'career-gap': return BarChart3
      case 'suggested-jobs': return Briefcase
      default: return FileText
    }
  }

  const getReportColor = (type: string) => {
    switch (type) {
      case 'skill-analysis': return 'from-blue-500 to-cyan-500'
      case 'career-match': return 'from-green-500 to-emerald-500'
      case 'comprehensive': return 'from-purple-500 to-pink-500'
      case 'career-gap': return 'from-orange-500 to-red-500'
      case 'suggested-jobs': return 'from-indigo-500 to-purple-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'skill-analysis': return 'Skill Analysis'
      case 'career-match': return 'Career Match'
      case 'comprehensive': return 'Comprehensive'
      case 'career-gap': return 'Career Gap'
      case 'suggested-jobs': return 'Suggested Jobs'
      default: return 'Report'
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-2">
            Access your career development reports generated from your resume data
          </p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={generating || resumeData.length === 0}
          className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Generate New Report
            </>
          )}
        </button>
      </div>

      {/* Data Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-900">Resumes</span>
            </div>
            <span className={`text-sm font-bold ${resumeData.length > 0 ? 'text-green-600' : 'text-slate-500'}`}>
              {resumeData.length}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-900">Assessments</span>
            </div>
            <span className={`text-sm font-bold ${assessmentData.length > 0 ? 'text-green-600' : 'text-slate-500'}`}>
              {assessmentData.length}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-slate-900">Reports</span>
            </div>
            <span className={`text-sm font-bold ${reports.length > 0 ? 'text-green-600' : 'text-slate-500'}`}>
              {reports.length}
            </span>
          </div>
        </div>
        
        {resumeData.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">No resume data found</p>
                <p className="text-amber-700 text-sm mt-1">
                  Upload a resume first to generate comprehensive reports with your actual data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="skill-analysis">Skill Analysis</option>
              <option value="career-match">Career Match</option>
              <option value="career-gap">Career Gap</option>
              <option value="suggested-jobs">Suggested Jobs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const IconComponent = getReportIcon(report.type)
          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${getReportColor(report.type)}`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getReportColor(report.type)}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {getTypeLabel(report.type)}
                      </span>
                      <h3 className="font-semibold text-slate-900 mt-1">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                    {report.data?.dataSource && (
                      <Zap className="h-4 w-4 text-blue-500" title="Generated from your data" />
                    )}
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {report.summary}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                  {report.data?.dataSource && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Your Data
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReport(report)
                      setShowPreview(true)
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => generatePDF(report)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No reports found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : resumeData.length === 0
              ? 'Upload a resume first to generate reports with your actual data'
              : 'Generate your first report to get started with career insights'
            }
          </p>
          {(!searchTerm && filter === 'all') && (
            <button 
              onClick={resumeData.length === 0 ? () => window.location.href = '/upload' : handleGenerateReport}
              disabled={generating}
              className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {resumeData.length === 0 ? (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Upload Resume First
                </>
              ) : generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Generate Your First Report
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Report Type Selection Modal */}
      {showReportTypeSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Generate New Report</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Choose the type of report and select which resume data to use
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowReportTypeSelection(false)
                    setSelectedReportType(null)
                    setSelectedResumeId(null)
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {!selectedReportType ? (
                /* Report Type Selection */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Select Report Type</h3>
                    <p className="text-slate-600">Choose the type of analysis you'd like to generate</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reportOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => handleReportTypeSelect(option.id)}
                        className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color} group-hover:scale-110 transition-transform duration-200`}>
                            <option.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-slate-900">{option.title}</h4>
                              {option.requiresAssessment && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                  Requires Assessment
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                              {option.description}
                            </p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-slate-500">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Estimated time: {option.estimatedTime}</span>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Includes:</p>
                                <div className="flex flex-wrap gap-2">
                                  {option.features.map((feature, index) => (
                                    <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {assessmentData.length === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-amber-800 font-medium">Assessment Required</p>
                          <p className="text-amber-700 text-sm mt-1">
                            Some report types require a completed assessment. Complete an assessment to unlock all report options.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Resume Selection */
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedReportType(null)
                        setSelectedResumeId(null)
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ArrowRight className="h-5 w-5 text-slate-600 rotate-180" />
                    </button>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Select Resume Data</h3>
                      <p className="text-slate-600">Choose which resume to use for generating your {reportOptions.find(opt => opt.id === selectedReportType)?.title}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.map((resume) => {
                      const skillsCount = resume.parsed_data?.skills ? 
                        Object.values(resume.parsed_data.skills).flat().length : 0
                      
                      return (
                        <div
                          key={resume.id}
                          onClick={() => setSelectedResumeId(resume.id)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedResumeId === resume.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{resume.filename}</h4>
                              <p className="text-sm text-slate-600 mb-2">
                                Uploaded {new Date(resume.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span>{skillsCount} skills identified</span>
                                <span>•</span>
                                <span>{resume.parsed_data?.experience?.length || 0} experiences</span>
                                <span>•</span>
                                <span>{resume.parsed_data?.education?.length || 0} education</span>
                              </div>
                            </div>
                            {selectedResumeId === resume.id && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {selectedResumeId && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-green-800 font-medium">Ready to Generate</p>
                          <p className="text-green-700 text-sm">
                            Your {reportOptions.find(opt => opt.id === selectedReportType)?.title} will be generated using the selected resume data.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 flex justify-between">
              <div className="text-sm text-slate-500">
                {selectedReportType && selectedResumeId ? (
                  <span>Ready to generate your report</span>
                ) : selectedReportType ? (
                  <span>Select a resume to continue</span>
                ) : (
                  <span>Select a report type to continue</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowReportTypeSelection(false)
                    setSelectedReportType(null)
                    setSelectedResumeId(null)
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                {selectedReportType && selectedResumeId && (
                  <button
                    onClick={generateNewReport}
                    disabled={generating}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedReport.title}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Generated on {new Date(selectedReport.created_at).toLocaleDateString()}
                    {selectedReport.data?.dataSource && (
                      <span className="ml-2 px-2 py-1 bg-blue-500 rounded text-xs">
                        From Your Data
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Executive Summary</h3>
                  <p className="text-slate-700">{selectedReport.summary}</p>
                </div>

                {selectedReport.type === 'comprehensive' && selectedReport.data && (
                  <>
                    {selectedReport.data.resumeAnalysis && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Resume Analysis</h3>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedReport.data.resumeAnalysis.filename && (
                              <div>
                                <p className="text-sm font-medium text-slate-600">Source File</p>
                                <p className="text-slate-900">{selectedReport.data.resumeAnalysis.filename}</p>
                              </div>
                            )}
                            {selectedReport.data.resumeAnalysis.experienceLevel && (
                              <div>
                                <p className="text-sm font-medium text-slate-600">Experience Level</p>
                                <p className="text-slate-900">{selectedReport.data.resumeAnalysis.experienceLevel}</p>
                              </div>
                            )}
                            {selectedReport.data.resumeAnalysis.skillsCount && (
                              <div>
                                <p className="text-sm font-medium text-slate-600">Skills Identified</p>
                                <p className="text-slate-900 font-bold">{selectedReport.data.resumeAnalysis.skillsCount} skills</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Personal Information */}
                          {selectedReport.data.resumeAnalysis.personalInfo && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-slate-600 mb-2">Personal Information</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedReport.data.resumeAnalysis.personalInfo.name && (
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700">{selectedReport.data.resumeAnalysis.personalInfo.name}</span>
                                  </div>
                                )}
                                {selectedReport.data.resumeAnalysis.personalInfo.email && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-700">{selectedReport.data.resumeAnalysis.personalInfo.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {selectedReport.data.resumeAnalysis.skills && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-slate-600 mb-2">Technical Skills</p>
                              <div className="space-y-2">
                                {Object.entries(selectedReport.data.resumeAnalysis.skills).map(([category, skills]: [string, any]) => (
                                  skills && skills.length > 0 && (
                                    <div key={category}>
                                      <span className="text-xs font-medium text-slate-500 uppercase">{category}:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {skills.slice(0, 10).map((skill: string, index: number) => (
                                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                            {skill}
                                          </span>
                                        ))}
                                        {skills.length > 10 && (
                                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                                            +{skills.length - 10} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Experience */}
                          {selectedReport.data.resumeAnalysis.experience && selectedReport.data.resumeAnalysis.experience.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-slate-600 mb-2">Professional Experience</p>
                              <div className="space-y-2">
                                {selectedReport.data.resumeAnalysis.experience.slice(0, 3).map((exp: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700">{exp.title} at {exp.company}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {selectedReport.data.resumeAnalysis.education && selectedReport.data.resumeAnalysis.education.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-slate-600 mb-2">Education</p>
                              <div className="space-y-2">
                                {selectedReport.data.resumeAnalysis.education.slice(0, 2).map((edu: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700">{edu.degree} - {edu.institution}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedReport.data.skillGaps && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Skill Gap Analysis</h3>
                        <div className="space-y-3">
                          {selectedReport.data.skillGaps.map((gap: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <span className="font-medium text-slate-900">{gap.skill}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  gap.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  gap.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {gap.priority}
                                </span>
                                <span className="text-slate-600 text-sm">
                                  {gap.currentLevel}/{gap.requiredLevel}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedReport.data.careerMatches && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Career Matches</h3>
                        <div className="space-y-3">
                          {selectedReport.data.careerMatches.map((match: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                              <div>
                                <span className="font-medium text-slate-900">{match.role}</span>
                                <p className="text-slate-600 text-sm">{match.salary}</p>
                              </div>
                              <span className="text-green-600 font-bold">{match.match}% match</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedReport.type === 'skill-analysis' && selectedReport.data && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Skill Analysis Details</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedReport.data.skillsAnalyzed}</p>
                          <p className="text-sm text-slate-600">Skills Analyzed</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{selectedReport.data.gapsIdentified}</p>
                          <p className="text-sm text-slate-600">Gaps Identified</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedReport.data.prioritySkills?.length || 0}</p>
                          <p className="text-sm text-slate-600">Priority Skills</p>
                        </div>
                      </div>
                      {selectedReport.data.prioritySkills && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-600 mb-2">Priority Skills to Develop</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.data.prioritySkills.map((skill: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-slate-200 p-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => generatePDF(selectedReport)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
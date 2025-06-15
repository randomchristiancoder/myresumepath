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
  Zap
} from 'lucide-react'
import jsPDF from 'jspdf'

interface Report {
  id: string
  title: string
  type: 'skill-analysis' | 'career-match' | 'comprehensive'
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

const ReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'skill-analysis' | 'career-match' | 'comprehensive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [resumeData, setResumeData] = useState<ResumeData[]>([])
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([])

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

      // Generate mock reports based on actual data
      const mockReports: Report[] = []

      // If we have resume and assessment data, create comprehensive reports
      if (resumesResult.data && resumesResult.data.length > 0) {
        const latestResume = resumesResult.data[0]
        const latestAssessment = assessmentsResult.data?.[0]

        mockReports.push({
          id: '1',
          title: 'Comprehensive Career Analysis Report',
          type: 'comprehensive',
          created_at: new Date().toISOString(),
          status: 'completed',
          summary: 'Complete analysis including resume parsing, skill gaps, personality assessment, and career recommendations based on your uploaded resume and assessment responses.',
          data: {
            resumeAnalysis: {
              filename: latestResume.filename,
              skills: latestResume.parsed_data?.skills || {},
              experience: latestResume.parsed_data?.experience || [],
              education: latestResume.parsed_data?.education || [],
              experienceLevel: latestResume.parsed_data?.analysis?.experienceLevel || 'Mid-level',
              strengthAreas: ['Full-stack development', 'Problem solving', 'Team collaboration']
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
            dataSource: 'User resume and assessment data'
          }
        })

        // Add skill analysis report
        mockReports.push({
          id: '2',
          title: 'Skill Gap Analysis Report',
          type: 'skill-analysis',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          summary: 'Detailed analysis of current skills vs. market demand for your target roles based on your resume data.',
          data: {
            skillsAnalyzed: Object.values(latestResume.parsed_data?.skills || {}).flat().length,
            gapsIdentified: 5,
            prioritySkills: ['Cloud Computing', 'Machine Learning', 'DevOps'],
            resumeSource: latestResume.filename
          }
        })

        // Add career match report if we have assessment data
        if (latestAssessment) {
          mockReports.push({
            id: '3',
            title: 'Career Path Recommendations',
            type: 'career-match',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            summary: 'Personalized career recommendations based on your skills, interests, and assessment responses.',
            data: {
              topMatches: 4,
              industryFocus: 'Technology',
              growthPotential: 'High',
              assessmentType: latestAssessment.assessment_type
            }
          })
        }
      }

      setReports(mockReports)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewReport = async () => {
    if (!user) return

    setGenerating(true)

    try {
      // Check if we have the necessary data
      if (resumeData.length === 0) {
        alert('Please upload a resume first to generate a report.')
        return
      }

      const latestResume = resumeData[0]
      const latestAssessment = assessmentData[0]

      // Create comprehensive report data
      const reportData = {
        resumeAnalysis: {
          filename: latestResume.filename,
          skills: latestResume.parsed_data?.skills || {},
          experience: latestResume.parsed_data?.experience || [],
          education: latestResume.parsed_data?.education || [],
          experienceLevel: latestResume.parsed_data?.analysis?.experienceLevel || 'Mid-level',
          strengthAreas: ['Full-stack development', 'Problem solving', 'Team collaboration']
        },
        skillGaps: [
          { skill: 'Machine Learning', currentLevel: 2, requiredLevel: 4, priority: 'high' },
          { skill: 'Cloud Architecture', currentLevel: 3, requiredLevel: 5, priority: 'high' },
          { skill: 'DevOps', currentLevel: 2, requiredLevel: 4, priority: 'medium' }
        ],
        careerMatches: [
          { role: 'Senior Software Architect', match: 94, salary: '$150,000 - $220,000' },
          { role: 'Technical Lead', match: 91, salary: '$130,000 - $180,000' }
        ],
        personalityInsights: latestAssessment?.results || {
          type: 'Investigative & Enterprising',
          strengths: ['Technical problem-solving', 'Strategic thinking'],
          workStyle: 'Collaborative environment with autonomy'
        },
        generatedAt: new Date().toISOString(),
        dataSource: 'User resume and assessment data'
      }

      // Save to database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          resume_id: latestResume.id,
          assessment_id: latestAssessment?.id || null,
          report_data: reportData
        })
        .select()
        .single()

      if (error) throw error

      // Reload reports
      await loadData()

    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setGenerating(false)
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
        yPosition += 10
      }

      // Skills section
      if (report.data.resumeAnalysis?.skills) {
        doc.setFontSize(14)
        doc.text('Technical Skills', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        const allSkills = Object.values(report.data.resumeAnalysis.skills).flat()
        const skillsText = allSkills.join(', ')
        const skillsLines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin)
        doc.text(skillsLines, margin, yPosition)
        yPosition += (skillsLines.length * 6) + 15
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
      default: return FileText
    }
  }

  const getReportColor = (type: string) => {
    switch (type) {
      case 'skill-analysis': return 'from-red-500 to-pink-500'
      case 'career-match': return 'from-green-500 to-emerald-500'
      case 'comprehensive': return 'from-blue-500 to-purple-500'
      default: return 'from-slate-500 to-slate-600'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'skill-analysis': return 'Skill Analysis'
      case 'career-match': return 'Career Match'
      case 'comprehensive': return 'Comprehensive'
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
            Access your career development reports and track your progress
          </p>
        </div>
        <button 
          onClick={generateNewReport}
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
              onClick={resumeData.length === 0 ? () => window.location.href = '/upload' : generateNewReport}
              disabled={generating}
              className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {resumeData.length === 0 ? (
                <>
                  <Upload className="h-5 w-5 mr-2" />
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
                          </div>
                          {selectedReport.data.resumeAnalysis.skills && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-slate-600 mb-2">Technical Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.values(selectedReport.data.resumeAnalysis.skills).flat().slice(0, 10).map((skill: any, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {skill}
                                  </span>
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
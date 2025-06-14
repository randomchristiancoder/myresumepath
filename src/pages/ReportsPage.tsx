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
  Brain
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

const ReportsPage: React.FC = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'skill-analysis' | 'career-match' | 'comprehensive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Mock data for demonstration
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Full Career Analysis Report',
      type: 'comprehensive',
      created_at: '2024-01-15T10:30:00Z',
      status: 'completed',
      summary: 'Complete analysis including resume parsing, skill gaps, personality assessment, and career recommendations.',
      data: {
        resumeAnalysis: {
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
          experience: '5+ years',
          education: 'Bachelor of Computer Science'
        },
        skillGaps: [
          { skill: 'Machine Learning', gap: 2 },
          { skill: 'Cloud Architecture', gap: 3 },
          { skill: 'DevOps', gap: 2 }
        ],
        careerMatches: [
          { role: 'Senior Software Engineer', match: 92 },
          { role: 'Technical Lead', match: 88 },
          { role: 'Solutions Architect', match: 85 }
        ],
        courseRecommendations: [
          'AWS Solutions Architect',
          'Machine Learning Specialization',
          'Advanced System Design'
        ]
      }
    },
    {
      id: '2',
      title: 'Skill Gap Analysis',
      type: 'skill-analysis',
      created_at: '2024-01-10T14:20:00Z',
      status: 'completed',
      summary: 'Detailed analysis of current skills vs. market demand for your target roles.',
      data: {
        skillsAnalyzed: 15,
        gapsIdentified: 5,
        prioritySkills: ['Cloud Computing', 'Machine Learning', 'DevOps']
      }
    },
    {
      id: '3',
      title: 'Career Path Recommendations',
      type: 'career-match',
      created_at: '2024-01-05T09:15:00Z',
      status: 'completed',
      summary: 'Personalized career recommendations based on your skills and interests.',
      data: {
        topMatches: 4,
        industryFocus: 'Technology',
        growthPotential: 'High'
      }
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

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
      // Skills section
      if (report.data.resumeAnalysis?.skills) {
        doc.setFontSize(14)
        doc.text('Technical Skills', margin, yPosition)
        yPosition += 15
        
        doc.setFontSize(11)
        const skillsText = report.data.resumeAnalysis.skills.join(', ')
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
          doc.text(`${index + 1}. ${gap.skill} (Gap level: ${gap.gap})`, margin + 10, yPosition)
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
          doc.text(`${index + 1}. ${match.role} (${match.match}% match)`, margin + 10, yPosition)
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
        report.data.courseRecommendations.forEach((course: string, index: number) => {
          doc.text(`${index + 1}. ${course}`, margin + 10, yPosition)
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
        <button className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
          <Plus className="h-5 w-5 mr-2" />
          Generate New Report
        </button>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {report.summary}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
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
              : 'Generate your first report to get started with career insights'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <button className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Generate Your First Report
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
                            <div>
                              <p className="text-sm font-medium text-slate-600">Experience</p>
                              <p className="text-slate-900">{selectedReport.data.resumeAnalysis.experience}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Education</p>
                              <p className="text-slate-900">{selectedReport.data.resumeAnalysis.education}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-slate-600 mb-2">Technical Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedReport.data.resumeAnalysis.skills.map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
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
                              <span className="text-red-600 font-medium">Gap: {gap.gap} levels</span>
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
                              <span className="font-medium text-slate-900">{match.role}</span>
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
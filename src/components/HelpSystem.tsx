import React, { useState } from 'react'
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Lightbulb,
  X
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  helpful?: number
}

interface HelpResource {
  id: string
  title: string
  description: string
  type: 'video' | 'article' | 'guide'
  url: string
  duration?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const HelpSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'faq' | 'resources' | 'contact'>('faq')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I upload my resume?',
      answer: 'You can upload your resume by going to the Upload page and either dragging and dropping your file or clicking to browse. We support PDF, DOCX, and TXT formats up to 10MB.',
      category: 'Getting Started',
      helpful: 45
    },
    {
      id: '2',
      question: 'What file formats are supported?',
      answer: 'We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. For best results, we recommend using PDF format.',
      category: 'File Upload',
      helpful: 38
    },
    {
      id: '3',
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI analysis uses advanced natural language processing to extract information from your resume. Accuracy typically ranges from 85-95% depending on the resume format and clarity.',
      category: 'Analysis',
      helpful: 52
    },
    {
      id: '4',
      question: 'Can I edit the extracted information?',
      answer: 'Yes! After analysis, you can review and edit any extracted information to ensure accuracy before generating reports or recommendations.',
      category: 'Analysis',
      helpful: 29
    },
    {
      id: '5',
      question: 'Is my data secure and private?',
      answer: 'Absolutely. We use enterprise-grade encryption for all data transmission and storage. You retain full ownership of your data and can delete it at any time.',
      category: 'Privacy & Security',
      helpful: 67
    },
    {
      id: '6',
      question: 'How do I generate a career report?',
      answer: 'After uploading and analyzing your resume, go to the Reports page and click "Generate New Report". You can customize which sections to include and download as PDF.',
      category: 'Reports',
      helpful: 41
    },
    {
      id: '7',
      question: 'What are skill gaps and how are they identified?',
      answer: 'Skill gaps are missing skills for your target roles. We compare your current skills against job market requirements and industry standards to identify areas for improvement.',
      category: 'Skills',
      helpful: 33
    },
    {
      id: '8',
      question: 'Can I use this for multiple resumes?',
      answer: 'Yes! You can upload and analyze multiple resumes. Each analysis is saved to your profile for easy comparison and tracking over time.',
      category: 'Multiple Resumes',
      helpful: 25
    }
  ]

  const helpResources: HelpResource[] = [
    {
      id: '1',
      title: 'Getting Started with My Resume Path',
      description: 'Complete walkthrough of platform features and how to get the most out of your analysis',
      type: 'video',
      url: '#',
      duration: '8 min',
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Optimizing Your Resume for AI Analysis',
      description: 'Best practices for formatting your resume to get the most accurate analysis results',
      type: 'guide',
      url: '#',
      difficulty: 'beginner'
    },
    {
      id: '3',
      title: 'Understanding Skill Gap Analysis',
      description: 'Learn how to interpret skill gap results and create an effective learning plan',
      type: 'article',
      url: '#',
      difficulty: 'intermediate'
    },
    {
      id: '4',
      title: 'Career Matching and Job Search Strategies',
      description: 'How to use career matching results to focus your job search and applications',
      type: 'guide',
      url: '#',
      difficulty: 'intermediate'
    },
    {
      id: '5',
      title: 'Advanced Reporting Features',
      description: 'Deep dive into report customization and sharing options for career coaches',
      type: 'video',
      url: '#',
      duration: '12 min',
      difficulty: 'advanced'
    }
  ]

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const faqCategories = [...new Set(faqItems.map(item => item.category))]

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'article': return <Book className="h-4 w-4" />
      case 'guide': return <Lightbulb className="h-4 w-4" />
      default: return <Book className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Help & Support</h1>
                <p className="text-blue-100 text-sm">Find answers and get assistance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'resources', label: 'Resources', icon: Book },
              { id: 'contact', label: 'Contact', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600'
                    : 'text-blue-100 hover:text-white hover:bg-blue-500'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* FAQ Categories */}
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-slate-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-slate-700 mb-3">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Category: {faq.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500">Was this helpful?</span>
                            <button className="text-green-600 hover:text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <span className="text-xs text-slate-500">{faq.helpful} found helpful</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Learning Resources</h2>
                <p className="text-slate-600">
                  Guides, tutorials, and best practices to help you get the most out of My Resume Path
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpResources.map((resource) => (
                  <div key={resource.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 mb-1">{resource.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                              {resource.difficulty}
                            </span>
                            {resource.duration && (
                              <span className="text-xs text-slate-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {resource.duration}
                              </span>
                            )}
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            View
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Get in Touch</h2>
                <p className="text-slate-600">
                  Need personalized help? Our support team is here to assist you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Live Chat</h3>
                  </div>
                  <p className="text-blue-800 text-sm mb-4">
                    Get instant help from our support team during business hours
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-blue-700 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Mon-Fri, 9 AM - 6 PM EST</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Start Chat
                  </button>
                </div>

                <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900">Email Support</h3>
                  </div>
                  <p className="text-green-800 text-sm mb-4">
                    Send us a detailed message and we'll respond within 24 hours
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-green-700 mb-4">
                    <Mail className="h-4 w-4" />
                    <span>support@myresumepath.com</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Send Email
                  </button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-4">Send us a message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>General Question</option>
                      <option>Technical Issue</option>
                      <option>Feature Request</option>
                      <option>Account Problem</option>
                      <option>Billing Question</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your question or issue..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Status */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">All systems operational</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Current response time: Under 2 hours
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HelpSystem
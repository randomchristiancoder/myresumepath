import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Building,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Star,
  Clock,
  Users,
  TrendingUp,
  Award,
  ArrowLeft,
  Bookmark,
  Share,
  Eye,
  CheckCircle2,
  AlertCircle,
  Globe,
  Target,
  Zap
} from 'lucide-react'

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  type: 'full-time' | 'part-time' | 'contract' | 'remote'
  posted: string
  description: string
  requirements: string[]
  skills: string[]
  match?: number
  benefits?: string[]
  companySize?: string
  industry?: string
  remote?: boolean
  experience?: string
  url?: string
}

const JobBoardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const jobId = searchParams.get('job')
  
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [salaryFilter, setSalaryFilter] = useState<string>('all')

  useEffect(() => {
    loadJobListings()
  }, [])

  useEffect(() => {
    if (jobId && jobListings.length > 0) {
      const job = jobListings.find(j => j.id === jobId)
      if (job) {
        setSelectedJob(job)
      }
    }
  }, [jobId, jobListings])

  const loadJobListings = async () => {
    setLoading(true)
    try {
      // Mock comprehensive job listings - in production, this would call job board APIs
      const mockJobs: JobListing[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          salary: '$140,000 - $180,000',
          type: 'full-time',
          posted: '2 days ago',
          description: 'Join our team building scalable web applications that serve millions of users. We\'re looking for an experienced engineer who can lead technical initiatives and mentor junior developers.',
          requirements: [
            '5+ years of software development experience',
            'Strong proficiency in JavaScript, TypeScript, and React',
            'Experience with Node.js and cloud platforms',
            'Leadership and mentoring experience',
            'Bachelor\'s degree in Computer Science or equivalent'
          ],
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
          match: 94,
          benefits: ['Health Insurance', 'Stock Options', 'Remote Work', '401k'],
          companySize: '500-1000 employees',
          industry: 'Technology',
          remote: true,
          experience: 'Senior Level',
          url: 'https://techcorp.com/careers'
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          salary: '$120,000 - $160,000',
          type: 'remote',
          posted: '1 week ago',
          description: 'Build the future of fintech with our growing team. You\'ll work on cutting-edge financial technology solutions that impact millions of users worldwide.',
          requirements: [
            '3+ years of full-stack development experience',
            'Proficiency in JavaScript, Python, or similar',
            'Experience with modern web frameworks',
            'Knowledge of database design and optimization',
            'Strong problem-solving skills'
          ],
          skills: ['JavaScript', 'Python', 'AWS', 'PostgreSQL', 'React'],
          match: 87,
          benefits: ['Equity', 'Flexible Hours', 'Learning Budget', 'Health Insurance'],
          companySize: '50-100 employees',
          industry: 'Fintech',
          remote: true,
          experience: 'Mid Level',
          url: 'https://startupxyz.com/jobs'
        },
        {
          id: '3',
          title: 'Frontend Engineer',
          company: 'Design Co',
          location: 'New York, NY',
          salary: '$110,000 - $140,000',
          type: 'full-time',
          posted: '3 days ago',
          description: 'Create beautiful user experiences that delight our customers. Work closely with our design team to implement pixel-perfect interfaces.',
          requirements: [
            '3+ years of frontend development experience',
            'Expert knowledge of React and modern CSS',
            'Experience with design systems and component libraries',
            'Strong attention to detail',
            'Portfolio of previous work'
          ],
          skills: ['React', 'CSS', 'Figma', 'TypeScript', 'Tailwind'],
          match: 82,
          benefits: ['Health Insurance', 'Dental', 'Vision', 'PTO'],
          companySize: '100-200 employees',
          industry: 'Design',
          remote: false,
          experience: 'Mid Level',
          url: 'https://designco.com/careers'
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudTech Solutions',
          location: 'Austin, TX',
          salary: '$130,000 - $170,000',
          type: 'full-time',
          posted: '5 days ago',
          description: 'Manage cloud infrastructure and deployment pipelines for our enterprise clients. Help scale our platform to handle millions of requests.',
          requirements: [
            '4+ years of DevOps/Infrastructure experience',
            'Strong knowledge of AWS, Docker, and Kubernetes',
            'Experience with CI/CD pipelines',
            'Infrastructure as Code experience',
            'Strong scripting skills'
          ],
          skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
          match: 78,
          benefits: ['Stock Options', 'Health Insurance', 'Remote Work', 'Conference Budget'],
          companySize: '200-500 employees',
          industry: 'Cloud Services',
          remote: true,
          experience: 'Senior Level',
          url: 'https://cloudtech.com/jobs'
        },
        {
          id: '5',
          title: 'Product Manager',
          company: 'InnovateLabs',
          location: 'Seattle, WA',
          salary: '$150,000 - $190,000',
          type: 'full-time',
          posted: '1 day ago',
          description: 'Lead product strategy and development for our AI-powered platform. Work with engineering and design teams to deliver exceptional user experiences.',
          requirements: [
            '5+ years of product management experience',
            'Experience with AI/ML products',
            'Strong analytical and communication skills',
            'Technical background preferred',
            'MBA or equivalent experience'
          ],
          skills: ['Product Strategy', 'Analytics', 'AI/ML', 'Agile', 'Leadership'],
          match: 71,
          benefits: ['Equity', 'Health Insurance', 'Flexible PTO', 'Learning Budget'],
          companySize: '100-300 employees',
          industry: 'AI/ML',
          remote: true,
          experience: 'Senior Level',
          url: 'https://innovatelabs.com/careers'
        },
        {
          id: '6',
          title: 'Data Scientist',
          company: 'DataDriven Corp',
          location: 'Boston, MA',
          salary: '$125,000 - $165,000',
          type: 'full-time',
          posted: '4 days ago',
          description: 'Analyze large datasets to drive business insights and build predictive models. Work with cross-functional teams to implement data-driven solutions.',
          requirements: [
            '3+ years of data science experience',
            'Strong Python and SQL skills',
            'Experience with machine learning frameworks',
            'Statistical analysis expertise',
            'PhD or Master\'s in related field'
          ],
          skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'TensorFlow'],
          match: 68,
          benefits: ['Health Insurance', 'Research Time', 'Conference Budget', '401k'],
          companySize: '300-500 employees',
          industry: 'Data Analytics',
          remote: false,
          experience: 'Mid Level',
          url: 'https://datadriven.com/jobs'
        }
      ]

      setJobListings(mockJobs)
    } catch (error) {
      console.error('Error loading job listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesLocation = !locationFilter || 
                           job.location.toLowerCase().includes(locationFilter.toLowerCase())
    
    const matchesType = typeFilter === 'all' || job.type === typeFilter
    
    const matchesSalary = salaryFilter === 'all' || 
                         (salaryFilter === 'high' && job.salary && parseInt(job.salary.replace(/[^0-9]/g, '')) >= 150000) ||
                         (salaryFilter === 'medium' && job.salary && parseInt(job.salary.replace(/[^0-9]/g, '')) >= 100000 && parseInt(job.salary.replace(/[^0-9]/g, '')) < 150000) ||
                         (salaryFilter === 'entry' && job.salary && parseInt(job.salary.replace(/[^0-9]/g, '')) < 100000)
    
    return matchesSearch && matchesLocation && matchesType && matchesSalary
  })

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'remote': return 'bg-green-100 text-green-800'
      case 'full-time': return 'bg-blue-100 text-blue-800'
      case 'part-time': return 'bg-yellow-100 text-yellow-800'
      case 'contract': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleJobClick = (job: JobListing) => {
    setSelectedJob(job)
    navigate(`/jobs?job=${job.id}`)
  }

  const handleBackToList = () => {
    setSelectedJob(null)
    navigate('/jobs')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job opportunities...</p>
        </div>
      </div>
    )
  }

  // Job Detail View
  if (selectedJob) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Job Board
          </button>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Bookmark className="h-4 w-4 mr-2" />
              Save Job
            </button>
            <button className="flex items-center px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Share className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.title}</h1>
              <div className="flex items-center space-x-4 text-lg">
                <div className="flex items-center text-blue-600">
                  <Building className="h-5 w-5 mr-2" />
                  {selectedJob.company}
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {selectedJob.location}
                </div>
              </div>
            </div>
            {selectedJob.match && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{selectedJob.match}%</div>
                <div className="text-sm text-slate-500">Match</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Salary</p>
                <p className="font-semibold text-slate-900">{selectedJob.salary || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Type</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(selectedJob.type)}`}>
                  {selectedJob.type}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Company Size</p>
                <p className="font-semibold text-slate-900">{selectedJob.companySize || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-slate-600">Posted</p>
                <p className="font-semibold text-slate-900">{selectedJob.posted}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold">
              Apply Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Job Description</h2>
              <p className="text-slate-700 leading-relaxed">{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {selectedJob.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Industry</p>
                  <p className="font-semibold text-slate-900">{selectedJob.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Company Size</p>
                  <p className="font-semibold text-slate-900">{selectedJob.companySize}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Experience Level</p>
                  <p className="font-semibold text-slate-900">{selectedJob.experience}</p>
                </div>
                {selectedJob.remote && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Remote Friendly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            {selectedJob.benefits && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Benefits & Perks</h3>
                <div className="space-y-2">
                  {selectedJob.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Analysis */}
            {selectedJob.match && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Match Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Overall Match</span>
                    <span className="text-2xl font-bold text-green-600">{selectedJob.match}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedJob.match}%` }}
                    ></div>
                  </div>
                  <p className="text-green-700 text-sm">
                    This position aligns well with your skills and experience profile.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Job List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Job Board</h1>
        <p className="text-lg text-slate-600">
          Discover opportunities that match your skills and career goals
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <input
            type="text"
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
          <select
            value={salaryFilter}
            onChange={(e) => setSalaryFilter(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Salaries</option>
            <option value="entry">Under $100k</option>
            <option value="medium">$100k - $150k</option>
            <option value="high">$150k+</option>
          </select>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-600">
            Showing {filteredJobs.length} of {jobListings.length} jobs
          </p>
          <button
            onClick={loadJobListings}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => handleJobClick(job)}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{job.title}</h3>
                <div className="flex items-center text-blue-600 mb-2">
                  <Building className="h-4 w-4 mr-2" />
                  {job.company}
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
              </div>
              {job.match && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{job.match}%</div>
                  <div className="text-xs text-slate-500">match</div>
                </div>
              )}
            </div>

            <p className="text-slate-700 text-sm mb-4 line-clamp-2">{job.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {job.salary && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </div>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
                  {job.type}
                </span>
              </div>
              <div className="flex items-center text-slate-500 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {job.posted}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {job.remote && (
                  <span className="flex items-center text-green-600 text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Remote
                  </span>
                )}
                {job.experience && (
                  <span className="text-slate-500 text-xs">{job.experience}</span>
                )}
              </div>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                View Details
                <ExternalLink className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
          <p className="text-slate-600">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  )
}

export default JobBoardPage
import express from 'express'
import { supabase } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Job matching endpoint
router.post('/job-matches', requireAuth, async (req, res) => {
  try {
    const { skills, interests, location, experience, userId } = req.body

    // Mock job matching data - in production, this would integrate with job APIs
    const jobMatches = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: location || 'San Francisco, CA',
        salary: '$140,000 - $180,000',
        match: 94,
        description: 'Lead development of scalable web applications using modern technologies.',
        requirements: skills || ['JavaScript', 'React', 'Node.js'],
        remote: true,
        posted: '2 days ago'
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: location || 'Remote',
        salary: '$120,000 - $160,000',
        match: 89,
        description: 'Build end-to-end solutions for our growing platform.',
        requirements: skills || ['JavaScript', 'Python', 'React'],
        remote: true,
        posted: '1 week ago'
      },
      {
        id: '3',
        title: 'Technical Lead',
        company: 'Innovation Labs',
        location: location || 'New York, NY',
        salary: '$160,000 - $200,000',
        match: 87,
        description: 'Lead a team of developers and architect technical solutions.',
        requirements: skills || ['Leadership', 'JavaScript', 'System Design'],
        remote: false,
        posted: '3 days ago'
      },
      {
        id: '4',
        title: 'Cloud Solutions Architect',
        company: 'CloudTech',
        location: location || 'Seattle, WA',
        salary: '$150,000 - $190,000',
        match: 82,
        description: 'Design and implement cloud infrastructure solutions.',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'System Design'],
        remote: true,
        posted: '5 days ago'
      }
    ]

    // Store job search in database
    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: 'job_search',
        responses: { skills, interests, location, experience },
        results: { jobMatches }
      })

    if (error) {
      console.error('Error storing job search:', error)
    }

    res.json({
      success: true,
      jobMatches,
      aiEnhanced: true,
      searchCriteria: { skills, interests, location, experience }
    })
  } catch (error) {
    console.error('Job matching error:', error)
    res.status(500).json({ error: 'Failed to find job matches' })
  }
})

// Course recommendations endpoint
router.post('/course-recommendations', requireAuth, async (req, res) => {
  try {
    const { skillGaps, careerGoals, currentSkills, userId } = req.body

    // Mock course recommendations - in production, this would integrate with course APIs
    const courseRecommendations = [
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
        title: 'React Advanced Patterns',
        provider: 'Frontend Masters',
        duration: '8 hours',
        level: 'Advanced',
        rating: 4.6,
        price: '$39/month',
        skills: ['React', 'JavaScript', 'Frontend Development'],
        url: 'https://frontendmasters.com/',
        description: 'Advanced React patterns and performance optimization.',
        category: 'Frontend Development'
      },
      {
        id: '5',
        title: 'System Design Interview',
        provider: 'Educative',
        duration: '20 hours',
        level: 'Advanced',
        rating: 4.5,
        price: '$79',
        skills: ['System Design', 'Architecture', 'Scalability'],
        url: 'https://educative.io/',
        description: 'Master system design concepts for technical interviews.',
        category: 'System Design'
      }
    ]

    // Store course search in database
    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: 'course_search',
        responses: { skillGaps, careerGoals, currentSkills },
        results: { courseRecommendations }
      })

    if (error) {
      console.error('Error storing course search:', error)
    }

    res.json({
      success: true,
      courseRecommendations,
      aiEnhanced: true,
      searchCriteria: { skillGaps, careerGoals, currentSkills }
    })
  } catch (error) {
    console.error('Course recommendations error:', error)
    res.status(500).json({ error: 'Failed to get course recommendations' })
  }
})

// Personality analysis endpoint
router.post('/personality-analysis', requireAuth, async (req, res) => {
  try {
    const { responses, resumeData, userId } = req.body

    // Analyze personality based on responses
    const personalityInsights = {
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
        leadership_potential: responses.leadership_interest * 20 || 70,
        creativity_score: responses.technical_interest * 15 + 25 || 85,
        analytical_thinking: responses.technical_interest * 18 + 10 || 92,
        communication_skills: responses.leadership_interest * 15 + 25 || 80,
        adaptability: 85,
        teamwork: 90
      },
      workPreferences: {
        environment: responses.work_environment || 'Collaborative team environment',
        motivation: responses.career_motivation || 'Learning and personal growth',
        riskTolerance: responses.risk_tolerance || 3
      }
    }

    // Store personality analysis in database
    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: 'personality',
        responses,
        results: personalityInsights
      })

    if (error) {
      console.error('Error storing personality analysis:', error)
    }

    res.json({
      success: true,
      personalityInsights,
      aiEnhanced: true,
      analysisDate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Personality analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze personality' })
  }
})

// Report generation endpoint
router.post('/generate-report', requireAuth, async (req, res) => {
  try {
    const { userId, resumeId, assessmentId, reportType = 'comprehensive' } = req.body

    // Get resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single()

    if (resumeError && resumeError.code !== 'PGRST116') {
      throw resumeError
    }

    // Get assessment data
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (assessmentError) {
      throw assessmentError
    }

    // Generate comprehensive report
    const reportData = {
      resumeAnalysis: resume ? {
        skills: resume.parsed_data?.skills || {},
        experience: resume.parsed_data?.experience || [],
        education: resume.parsed_data?.education || [],
        certifications: resume.parsed_data?.certifications || [],
        strengthAreas: ['Full-stack development', 'Problem solving', 'Team collaboration'],
        experienceLevel: resume.parsed_data?.analysis?.experienceLevel || 'Mid-level',
        industryFocus: resume.parsed_data?.analysis?.industryFocus || ['Technology']
      } : null,
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
        },
        {
          title: 'DevOps Engineer Certification',
          provider: 'Linux Academy',
          duration: '6 weeks',
          price: '$199',
          skills: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD']
        }
      ],
      personalityInsights: assessments.find(a => a.assessment_type === 'personality')?.results || {
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
      reportType
    }

    // Store report in database
    const { data: newReport, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        resume_id: resumeId,
        assessment_id: assessmentId,
        report_data: reportData
      })
      .select()
      .single()

    if (reportError) {
      throw reportError
    }

    res.json({
      success: true,
      reportData,
      reportId: newReport.id,
      aiEnhanced: true
    })
  } catch (error) {
    console.error('Report generation error:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

// Skill gap analysis endpoint
router.post('/skill-gap-analysis', requireAuth, async (req, res) => {
  try {
    const { currentSkills, targetRole, userId } = req.body

    // Mock skill gap analysis
    const skillGaps = [
      {
        skill: 'Machine Learning',
        currentLevel: 1,
        requiredLevel: 4,
        priority: 'high',
        description: 'Essential for data-driven decision making',
        resources: ['Coursera ML Course', 'Kaggle Learn', 'Fast.ai']
      },
      {
        skill: 'Cloud Architecture',
        currentLevel: 2,
        requiredLevel: 5,
        priority: 'high',
        description: 'Critical for scalable system design',
        resources: ['AWS Solutions Architect', 'Azure Fundamentals', 'GCP Professional']
      },
      {
        skill: 'System Design',
        currentLevel: 3,
        requiredLevel: 5,
        priority: 'high',
        description: 'Required for senior engineering roles',
        resources: ['System Design Interview', 'High Scalability', 'Designing Data-Intensive Applications']
      },
      {
        skill: 'Leadership',
        currentLevel: 2,
        requiredLevel: 4,
        priority: 'medium',
        description: 'Important for career advancement',
        resources: ['Tech Lead Course', 'Management 3.0', 'The Manager\'s Path']
      }
    ]

    // Store analysis in database
    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_type: 'skill_gap',
        responses: { currentSkills, targetRole },
        results: { skillGaps }
      })

    if (error) {
      console.error('Error storing skill gap analysis:', error)
    }

    res.json({
      success: true,
      skillGaps,
      targetRole,
      aiEnhanced: true,
      analysisDate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Skill gap analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze skill gaps' })
  }
})

export default router
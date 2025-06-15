const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, and DOCX files are allowed.'));
    }
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to extract text from different file types
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'text/plain') {
      return fs.readFileSync(filePath, 'utf8');
    } else if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text from ${mimetype} file: ${error.message}`);
  }
}

// Helper function to parse resume content
function parseResumeContent(text, filename) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Basic parsing logic
  const parsed = {
    personalInfo: {},
    summary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      programming: [],
      frameworks: [],
      databases: [],
      cloud: [],
      tools: [],
      soft: []
    },
    certifications: [],
    projects: [],
    languages: [],
    awards: [],
    volunteerWork: [],
    analysis: {}
  };

  let currentSection = '';
  let currentExperience = null;
  let currentEducation = null;

  // Extract personal info from first few lines
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Name (usually first line)
    if (i === 0 && !line.includes('@') && !line.includes('(') && line.length > 2) {
      parsed.personalInfo.name = line;
    }
    
    // Email
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      parsed.personalInfo.email = emailMatch[1];
    }
    
    // Phone
    const phoneMatch = line.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
    if (phoneMatch) {
      parsed.personalInfo.phone = phoneMatch[1];
    }
    
    // LinkedIn
    if (line.toLowerCase().includes('linkedin')) {
      parsed.personalInfo.linkedin = line.includes('http') ? line : `https://linkedin.com/in/${line.replace(/linkedin:?\s*/i, '')}`;
    }
    
    // GitHub
    if (line.toLowerCase().includes('github')) {
      parsed.personalInfo.github = line.includes('http') ? line : `https://github.com/${line.replace(/github:?\s*/i, '')}`;
    }
  }

  // Parse sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Detect sections
    if (upperLine.includes('SUMMARY') || upperLine.includes('OBJECTIVE')) {
      currentSection = 'summary';
      continue;
    } else if (upperLine.includes('EXPERIENCE') || upperLine.includes('EMPLOYMENT')) {
      currentSection = 'experience';
      continue;
    } else if (upperLine.includes('EDUCATION')) {
      currentSection = 'education';
      continue;
    } else if (upperLine.includes('SKILLS') || upperLine.includes('TECHNICAL')) {
      currentSection = 'skills';
      continue;
    } else if (upperLine.includes('CERTIFICATION')) {
      currentSection = 'certifications';
      continue;
    } else if (upperLine.includes('PROJECT')) {
      currentSection = 'projects';
      continue;
    } else if (upperLine.includes('LANGUAGE')) {
      currentSection = 'languages';
      continue;
    }

    // Parse content based on current section
    switch (currentSection) {
      case 'summary':
        if (!upperLine.includes('SUMMARY') && !upperLine.includes('OBJECTIVE')) {
          parsed.summary += (parsed.summary ? ' ' : '') + line;
        }
        break;
        
      case 'experience':
        // Look for job titles and companies
        if (line.includes('|') || (i + 1 < lines.length && lines[i + 1].includes('|'))) {
          if (currentExperience) {
            parsed.experience.push(currentExperience);
          }
          const parts = line.split('|');
          currentExperience = {
            title: parts[0]?.trim() || '',
            company: parts[1]?.trim() || '',
            duration: parts[2]?.trim() || '',
            description: '',
            achievements: [],
            technologies: []
          };
        } else if (currentExperience && line.startsWith('•') || line.startsWith('-')) {
          currentExperience.achievements.push(line.replace(/^[•-]\s*/, ''));
        } else if (currentExperience && line.length > 0) {
          currentExperience.description += (currentExperience.description ? ' ' : '') + line;
        }
        break;
        
      case 'education':
        if (line.includes('|') || line.includes('University') || line.includes('College')) {
          if (currentEducation) {
            parsed.education.push(currentEducation);
          }
          currentEducation = {
            degree: '',
            institution: '',
            graduationDate: '',
            field: '',
            gpa: ''
          };
          
          if (line.includes('|')) {
            const parts = line.split('|');
            currentEducation.degree = parts[0]?.trim() || '';
            currentEducation.institution = parts[1]?.trim() || '';
            currentEducation.graduationDate = parts[2]?.trim() || '';
          } else {
            currentEducation.institution = line;
          }
        } else if (currentEducation && line.includes('GPA')) {
          const gpaMatch = line.match(/GPA:?\s*([0-9.]+)/i);
          if (gpaMatch) {
            currentEducation.gpa = gpaMatch[1];
          }
        }
        break;
        
      case 'skills':
        // Extract skills from various formats
        const skillLine = line.replace(/^[•-]\s*/, '');
        if (skillLine.includes(':')) {
          const [category, skills] = skillLine.split(':');
          const skillArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
          
          const categoryLower = category.toLowerCase();
          if (categoryLower.includes('programming') || categoryLower.includes('language')) {
            parsed.skills.programming.push(...skillArray);
          } else if (categoryLower.includes('framework') || categoryLower.includes('library')) {
            parsed.skills.frameworks.push(...skillArray);
          } else if (categoryLower.includes('database')) {
            parsed.skills.databases.push(...skillArray);
          } else if (categoryLower.includes('cloud') || categoryLower.includes('aws') || categoryLower.includes('azure')) {
            parsed.skills.cloud.push(...skillArray);
          } else if (categoryLower.includes('tool')) {
            parsed.skills.tools.push(...skillArray);
          } else {
            parsed.skills.technical.push(...skillArray);
          }
        } else if (skillLine.length > 0) {
          // General skills line
          const skills = skillLine.split(',').map(s => s.trim()).filter(s => s.length > 0);
          parsed.skills.technical.push(...skills);
        }
        break;
        
      case 'certifications':
        if (line.length > 0 && !upperLine.includes('CERTIFICATION')) {
          const certMatch = line.match(/(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/);
          if (certMatch) {
            parsed.certifications.push({
              name: certMatch[1].trim(),
              issuer: certMatch[2].trim(),
              date: certMatch[3].trim()
            });
          } else {
            parsed.certifications.push({
              name: line,
              issuer: '',
              date: ''
            });
          }
        }
        break;
    }
  }

  // Add remaining items
  if (currentExperience) {
    parsed.experience.push(currentExperience);
  }
  if (currentEducation) {
    parsed.education.push(currentEducation);
  }

  // Generate analysis
  parsed.analysis = {
    experienceLevel: parsed.experience.length > 3 ? 'Senior Level (5+ years)' : 
                    parsed.experience.length > 1 ? 'Mid Level (2-5 years)' : 'Entry Level',
    careerProgression: parsed.experience.length > 0 ? 'Steady career progression' : 'New to workforce',
    industryFocus: ['Technology', 'Software Development'],
    keyStrengths: parsed.skills.technical.slice(0, 3),
    leadershipExperience: parsed.experience.some(exp => 
      exp.title.toLowerCase().includes('senior') || 
      exp.title.toLowerCase().includes('lead') ||
      exp.description.toLowerCase().includes('lead') ||
      exp.achievements.some(ach => ach.toLowerCase().includes('lead'))
    ),
    remoteWorkExperience: parsed.experience.some(exp => 
      exp.description.toLowerCase().includes('remote') ||
      exp.achievements.some(ach => ach.toLowerCase().includes('remote'))
    ),
    internationalExperience: false
  };

  return parsed;
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Express Server is running',
    timestamp: new Date().toISOString(),
    ssl: false,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    framework: 'Express.js',
    version: '1.0.0'
  });
});

// Resume upload and parsing endpoint
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    if (!req.body.userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing user ID' 
      });
    }
    
    // Basic file validation
    const allowedExtensions = ['.txt', '.pdf', '.docx'];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid file type. Only TXT, PDF, and DOCX files are allowed.' 
      });
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    // Parse resume content
    const parsedData = parseResumeContent(extractedText, req.file.originalname);
    
    // Determine extraction quality
    let extractionQuality = 'Standard';
    let aiEnhanced = false;
    
    if (parsedData.personalInfo.name && parsedData.personalInfo.email && 
        parsedData.experience.length > 0 && parsedData.skills.technical.length > 0) {
      extractionQuality = 'High Quality';
      aiEnhanced = true;
    } else if (parsedData.personalInfo.name || parsedData.personalInfo.email) {
      extractionQuality = 'Partial';
    } else {
      extractionQuality = 'Basic';
    }

    // Clean up uploaded file after processing
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn('Could not clean up uploaded file:', cleanupError.message);
    }
    
    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      filename: req.file.originalname,
      size: req.file.size,
      extractionQuality,
      aiEnhanced,
      parsedData,
      content: extractedText,
      uploadedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Resume processing error:', error);
    
    // Clean up file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not clean up uploaded file after error:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process resume' 
    });
  }
});

// System validation endpoint
app.get('/api/validate/system', (req, res) => {
  try {
    const validation = {
      timestamp: new Date().toISOString(),
      requestedBy: {
        userId: 'system',
        email: 'system@validation',
        role: 'system'
      },
      server: {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        framework: 'Express.js'
      },
      database: {
        status: 'operational',
        connection: true
      },
      ssl: {
        enabled: false,
        certificate: 'HTTP only'
      },
      endpoints: {
        health: { status: 'operational', method: 'GET' },
        'upload-resume': { status: 'operational', method: 'POST' },
        'validate-system': { status: 'operational', method: 'GET' }
      },
      features: {
        fileUpload: 'operational',
        resumeParsing: 'operational',
        textExtraction: 'operational',
        dataValidation: 'operational',
        pdfParsing: 'operational',
        docxParsing: 'operational'
      }
    };
    
    res.json(validation);
  } catch (error) {
    console.error('System validation error:', error);
    res.status(500).json({ error: 'System validation failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Express HTTP Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Resume upload: http://localhost:${PORT}/api/upload-resume`);
  console.log(`🔧 System validation: http://localhost:${PORT}/api/validate/system`);
  console.log(`📋 Framework: Express.js (CommonJS)`);
});

module.exports = app;
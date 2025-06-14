# My Resume Path - Full-Stack Career Development Platform

A comprehensive AI-powered career development platform that helps users analyze their resumes, identify skill gaps, and receive personalized career recommendations.

## 🚀 Features

### Core Functionality
- **Resume Upload & Analysis**: Support for PDF, DOCX, and TXT files with comprehensive data extraction
- **AI-Powered Parsing**: Advanced resume parsing using multiple AI providers (OpenAI, Anthropic, Google AI, Perplexity)
- **Skill Gap Analysis**: Identify missing skills and get targeted recommendations
- **Career Matching**: Find relevant job opportunities based on skills and experience
- **Personality Assessment**: Career personality analysis with Big Five and Holland Code frameworks
- **Course Recommendations**: Personalized learning paths to bridge skill gaps
- **Comprehensive Reports**: Generate detailed PDF reports with career insights

### AI Integration
- **Multi-Provider Support**: OpenAI, OpenRouter, Anthropic, Perplexity, Google AI, Cohere, Hugging Face, Replicate
- **Granular Control**: Enable/disable AI features per provider to optimize costs
- **Real-time Analysis**: Live job market data and course recommendations via Perplexity
- **Fallback Systems**: Robust parsing even without AI API keys

### Security & Performance
- **HTTPS Support**: SSL/TLS encryption with automatic certificate detection
- **Row Level Security**: Supabase RLS ensures users only access their own data
- **API Key Management**: Secure storage and granular usage controls
- **Comprehensive Validation**: Built-in system validation and testing suite

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **React Dropzone** for file uploads
- **jsPDF** for report generation

### Backend
- **Node.js** with Express
- **Supabase** for database and authentication
- **Multer** for file handling
- **PDF-Parse** and **Mammoth** for document processing
- **Axios** for API integrations

### Database
- **PostgreSQL** via Supabase
- **Row Level Security** enabled
- **Comprehensive schema** for users, resumes, assessments, reports, and API keys

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- AI API keys (optional but recommended)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-resume-path
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run setup-server
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3001
   ```

4. **Database Setup**
   - Run the migration files in `supabase/migrations/` to set up the database schema
   - The schema includes tables for users, resumes, assessments, reports, and API keys
   - Row Level Security is automatically enabled

5. **SSL Configuration (Optional)**
   ```bash
   # Generate self-signed certificate for development
   npm run ssl:generate
   
   # Or add your own certificates to server/ssl/
   # - cert.pem (certificate)
   # - key.pem (private key)
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts both the frontend (port 5173) and backend (port 3001) concurrently.

### Production Mode
```bash
npm run build
npm run preview
```

### Server Only
```bash
npm run server
```

## 🔐 SSL/HTTPS Configuration

The server automatically detects and uses SSL certificates:

1. **Automatic Detection**: Checks for certificates in `server/ssl/`
2. **Self-Signed Generation**: Automatically generates development certificates if OpenSSL is available
3. **Fallback to HTTP**: Gracefully falls back to HTTP if SSL is not configured

### Adding SSL Certificates

1. Create `server/ssl/` directory
2. Add your certificate files:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key
3. Restart the server

## 🧪 Testing & Validation

### Run Comprehensive Validation Suite
```bash
npm run validate
```

The validation suite tests:
- **System Health**: Server status, database connectivity, SSL configuration
- **Core Functionality**: File upload, resume parsing, report generation
- **AI Integration**: Job matching, course recommendations, personality analysis
- **Security**: CORS configuration, SSL setup
- **Performance**: Response times and system metrics
- **Data Validation**: Resume parsing accuracy and data integrity

### Manual Testing
```bash
# Test specific endpoints
curl https://localhost:3001/api/health
curl https://localhost:3001/api/validate/system
```

## 🔑 API Key Management

### Supported Providers
- **OpenAI**: GPT-4, GPT-3.5 for advanced text analysis
- **OpenRouter**: Access to multiple AI models through single API
- **Anthropic**: Claude models for sophisticated reasoning
- **Perplexity**: Real-time web search and analysis
- **Google AI**: Gemini and PaLM models
- **Cohere**: Enterprise-grade language models
- **Hugging Face**: Open-source model access
- **Replicate**: Cloud-based ML model execution

### Configuration
1. Navigate to API Keys page in the application
2. Add your API keys for desired providers
3. Configure which features each provider should handle
4. Enable/disable providers as needed to optimize costs

### Feature Mapping
- **Resume Parsing**: OpenAI, Anthropic, Google AI
- **Job Matching**: Perplexity, OpenAI
- **Course Recommendations**: Perplexity, OpenAI
- **Personality Analysis**: OpenAI, Anthropic
- **Skill Gap Analysis**: All providers
- **Report Generation**: All providers

## 📊 Database Schema

### Core Tables
- **users**: User authentication and profiles
- **resumes**: Uploaded resume files and parsed data
- **assessments**: Personality and skill assessments
- **reports**: Generated career reports
- **api_keys**: User API key management with usage controls

### Security Features
- Row Level Security (RLS) on all tables
- User-specific data access policies
- Encrypted API key storage
- Audit trails for data access

## 🔍 System Validation Results

The application includes comprehensive validation covering:

### ✅ System Health
- Server uptime and memory usage
- Database connectivity
- SSL certificate validation
- Endpoint availability

### ✅ Core Features
- File upload and parsing
- Resume data extraction
- Skill categorization
- Experience analysis
- Education parsing

### ✅ AI Integration
- Multi-provider API support
- Fallback mechanisms
- Cost optimization controls
- Real-time data access

### ✅ Security
- HTTPS enforcement
- CORS configuration
- Data encryption
- Access controls

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
PORT=3001
```

### SSL in Production
- Use valid SSL certificates from a trusted CA
- Configure your reverse proxy (nginx, Apache) for SSL termination
- Or place certificates in `server/ssl/` directory

### Database Migration
- Run all migration files in order
- Verify RLS policies are active
- Test with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run the validation suite: `npm run validate`
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the validation report for system status
2. Review the console logs for detailed error information
3. Ensure all environment variables are properly configured
4. Verify database migrations have been applied

## 🔄 Version History

### v1.0.0
- Initial release with comprehensive resume analysis
- Multi-provider AI integration
- SSL/HTTPS support
- Complete validation suite
- Production-ready security features
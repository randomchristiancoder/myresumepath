# My Resume Path - AI-Powered Career Development Platform

A comprehensive, production-ready career development platform that leverages AI to analyze resumes, identify skill gaps, and provide personalized career recommendations.

## 🚀 Features

### Core Functionality
- **AI-Powered Resume Analysis**: Advanced parsing with comprehensive data extraction
- **Career Assessment**: Personality and skills evaluation with Big Five framework
- **Skill Gap Analysis**: Identify missing skills with targeted recommendations
- **Job Matching**: Find relevant opportunities based on skills and experience
- **Course Recommendations**: Personalized learning paths to bridge skill gaps
- **Comprehensive Reports**: Generate detailed PDF reports with career insights
- **Real-time Dashboard**: Track progress with interactive analytics

### Technical Excellence
- **Modern React Architecture**: Built with React 18, TypeScript, and Tailwind CSS
- **Robust Backend**: Express.js server with comprehensive file processing
- **Database Integration**: Supabase with Row Level Security (RLS)
- **Error Handling**: Comprehensive error boundaries and validation
- **Performance Optimized**: Lazy loading, debouncing, and efficient state management
- **Mobile Responsive**: Fully responsive design with mobile-first approach

### Security & Performance
- **Authentication**: Secure user authentication with Supabase Auth
- **Data Protection**: Row Level Security ensures users only access their own data
- **File Validation**: Comprehensive file type and size validation
- **Error Boundaries**: Graceful error handling throughout the application
- **Performance Monitoring**: Built-in validation and testing suite

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for consistent iconography
- **React Router** for client-side routing
- **React Dropzone** for intuitive file uploads
- **jsPDF** for report generation

### Backend
- **Express.js** with CommonJS for server-side logic
- **Multer** for secure file handling
- **PDF-Parse** and **Mammoth** for document processing
- **CORS** for cross-origin resource sharing

### Database & Authentication
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Vite** for fast development and building
- **Concurrently** for running multiple processes

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase** account
- Modern web browser

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-resume-path
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

### 4. Database Setup
1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/` in order
3. The schema includes tables for users, resumes, assessments, reports, and API keys
4. Row Level Security is automatically enabled

### 5. Admin Account Setup (Optional)
Follow the instructions in `ADMIN_SETUP_INSTRUCTIONS.md` to create an admin test account with sample data.

## 🚀 Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`

### Production Build
```bash
npm run build
npm run preview
```

### Individual Services
```bash
# Frontend only
npm run client

# Backend only
npm run server
```

## 🧪 Testing & Validation

### Run Comprehensive Test Suite
```bash
npm run validate
```

The validation suite tests:
- **System Health**: Server status, database connectivity
- **Core Functionality**: File upload, resume parsing, report generation
- **Security**: CORS configuration, data validation
- **Performance**: Response times and system metrics

### Manual Testing
```bash
# Test server health
curl http://localhost:3001/api/health

# Test system validation
curl http://localhost:3001/api/validate/system
```

## 📊 Database Schema

### Core Tables
- **`resumes`**: Uploaded resume files and parsed data
- **`assessments`**: Personality and skill assessments
- **`reports`**: Generated career reports
- **`api_keys`**: User API key management (for future AI integration)
- **`user_roles`**: Role-based access control

### Security Features
- **Row Level Security (RLS)** on all tables
- **User-specific data access** policies
- **Audit trails** for data access
- **Encrypted sensitive data**

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`from-blue-600 to-purple-600`)
- **Secondary**: Purple gradient (`from-purple-500 to-pink-500`)
- **Success**: Green (`text-green-600`)
- **Warning**: Yellow (`text-yellow-600`)
- **Error**: Red (`text-red-600`)

### Typography
- **Headings**: Bold, hierarchical sizing
- **Body**: Readable, accessible contrast
- **Code**: Monospace for technical content

### Components
- **Consistent spacing**: 8px grid system
- **Rounded corners**: Modern, friendly appearance
- **Shadows**: Subtle depth and elevation
- **Animations**: Smooth, purposeful transitions

## 🔧 Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── lib/                # External library configurations
```

### Backend Architecture
```
server/
├── routes/             # API route handlers
├── middleware/         # Express middleware
├── config/             # Configuration files
└── uploads/            # Temporary file storage
```

### Key Features
- **Component-based architecture** for reusability
- **Custom hooks** for state management
- **Utility functions** for common operations
- **Error boundaries** for graceful error handling
- **TypeScript** for type safety throughout

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
PORT=3001
```

### Build Process
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Database Migration
1. Run all migration files in order
2. Verify RLS policies are active
3. Test with sample data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run the validation suite (`npm run validate`)
4. Ensure all tests pass
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive tests
- Maintain consistent code formatting
- Document new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Troubleshooting
1. **Server Connection Issues**: Ensure backend is running on port 3001
2. **Database Errors**: Verify Supabase credentials and RLS policies
3. **File Upload Problems**: Check file size limits and supported formats
4. **Authentication Issues**: Confirm Supabase Auth configuration

### Getting Help
- Check the validation report for system status
- Review console logs for detailed error information
- Ensure all environment variables are properly configured
- Verify database migrations have been applied

## 🔄 Version History

### v2.0.0 (Current)
- **Complete application refactor** with improved architecture
- **Enhanced UI/UX** with modern design system
- **Improved error handling** and validation
- **Better performance** with optimized components
- **Enhanced security** with comprehensive validation
- **Mobile-responsive design** with improved accessibility

### v1.0.0
- Initial release with basic resume analysis
- Supabase integration
- File upload and parsing
- Basic reporting functionality

## 🌟 Key Improvements in v2.0

### Architecture Enhancements
- **Modular component structure** for better maintainability
- **Custom hooks** for reusable logic
- **Utility functions** for common operations
- **Error boundaries** for graceful error handling
- **TypeScript throughout** for type safety

### User Experience
- **Enhanced dashboard** with real-time insights
- **Improved navigation** with mobile-responsive sidebar
- **Better loading states** and error messages
- **Intuitive file upload** with drag-and-drop
- **Comprehensive validation** with helpful feedback

### Performance
- **Optimized rendering** with React best practices
- **Efficient state management** with proper hooks
- **Lazy loading** for better initial load times
- **Debounced inputs** for better performance
- **Cached data** for improved user experience

### Security
- **Enhanced validation** for all user inputs
- **Secure file handling** with type checking
- **Proper error handling** without information leakage
- **Row Level Security** for data protection
- **Authentication improvements** with better error messages

---

**My Resume Path** - Empowering careers through AI-powered insights and comprehensive analysis.
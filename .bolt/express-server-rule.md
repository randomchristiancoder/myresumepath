# BOLT.NEW EXPRESS SERVER HARD RULE

## MANDATORY ARCHITECTURE REQUIREMENT

**THIS IS A HARD RULE THAT MUST BE FOLLOWED BY ALL AI AGENTS AND DEVELOPERS**

### EXPRESS SERVER REQUIREMENT

This application **MUST** use Express.js server architecture. Any deviation from this rule is strictly prohibited.

## REQUIRED SPECIFICATIONS

### 1. Backend Technology Stack
- **Framework**: Express.js (CommonJS format)
- **Module System**: CommonJS (`require`/`module.exports`) - NOT ES modules
- **Runtime**: Node.js
- **Package Manager**: npm

### 2. Server Configuration
```javascript
// REQUIRED: server/server.js structure
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// REQUIRED: Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// REQUIRED: Server startup
app.listen(PORT, () => {
  console.log(`✅ HTTP Server running on port ${PORT}`);
});
```

### 3. File Structure Requirements
```
server/
├── server.js          # Main Express server file (REQUIRED)
├── package.json       # Server dependencies (REQUIRED)
└── uploads/           # File upload directory (auto-created)
```

### 4. Package.json Requirements
```json
{
  "name": "resume-analyzer-server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1"
  }
}
```

## PROHIBITED TECHNOLOGIES

### ❌ NEVER USE:
- **Fastify** - Prohibited
- **Koa.js** - Prohibited  
- **Hapi.js** - Prohibited
- **NestJS** - Prohibited
- **Next.js API Routes** - Prohibited
- **Serverless Functions** - Prohibited
- **ES Modules in Backend** - Prohibited (`import`/`export`)
- **TypeScript in Backend** - Prohibited
- **SSL/HTTPS Configuration** - Prohibited (HTTP only)

## REQUIRED ENDPOINTS

### Mandatory API Endpoints:
1. `GET /api/health` - Health check endpoint
2. `POST /api/upload-resume` - Resume upload and parsing
3. `GET /api/validate/system` - System validation

### Example Implementation:
```javascript
// REQUIRED: Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// REQUIRED: Resume upload
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  // Implementation required
});
```

## DEVELOPMENT COMMANDS

### Required npm scripts in root package.json:
```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run dev --prefix server\"",
    "build": "vite build"
  }
}
```

### Required server startup:
```bash
# Start development server
npm run dev

# Or start server only
cd server && npm run dev
```

## ERROR HANDLING REQUIREMENTS

### Required Error Middleware:
```javascript
// REQUIRED: Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// REQUIRED: 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});
```

## FILE UPLOAD REQUIREMENTS

### Required Multer Configuration:
```javascript
const multer = require('multer');
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

## CORS REQUIREMENTS

### Required CORS Configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
```

## LOGGING REQUIREMENTS

### Required Console Logging:
```javascript
app.listen(PORT, () => {
  console.log(`✅ HTTP Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Resume upload: http://localhost:${PORT}/api/upload-resume`);
});
```

## VALIDATION REQUIREMENTS

Any AI agent or developer working on this project must:

1. ✅ Verify Express.js is used as the backend framework
2. ✅ Confirm CommonJS module system is used
3. ✅ Ensure HTTP-only configuration (no SSL/HTTPS)
4. ✅ Validate required endpoints exist
5. ✅ Check proper error handling is implemented
6. ✅ Confirm file upload functionality works
7. ✅ Verify CORS is properly configured

## ENFORCEMENT

### This rule is enforced by:
- **Bolt.new AI agents** - Must check this file before making backend changes
- **Code reviews** - Must verify Express.js compliance
- **Automated tests** - Must validate Express server functionality
- **Documentation** - Must reference this rule file

### Violation Consequences:
- ❌ **Immediate rejection** of non-Express implementations
- ❌ **Mandatory rewrite** to Express.js architecture
- ❌ **No exceptions** allowed without explicit approval

## RULE MODIFICATION

This rule can only be modified by:
1. Project owner explicit approval
2. Technical lead consensus
3. Documented business requirement change

**Last Updated**: December 2024  
**Rule Version**: 1.0  
**Enforcement Level**: MANDATORY  
**Compliance Required**: 100%

---

**⚠️ WARNING: Violation of this rule will result in immediate code rejection and mandatory rewrite to Express.js architecture.**
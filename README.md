# ResAlign AI

<div align="center">

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009485.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)

**AI-Powered Resume Analysis & Career Alignment Platform**

Align your resume and skills to land the job. Turn job descriptions into career action plans. Accelerate your career.

[Live Demo](#) • [Documentation](./docs/) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Support](#-support)

---

## 🎯 About the Project

**ResAlign AI** is an intelligent career alignment platform that leverages advanced machine learning to analyze the compatibility between your resume and job opportunities. Rather than simple keyword matching, ResAlign understands context and evaluates fit across multiple dimensions:

- **Skills Match** - Technical and professional skill alignment
- **Experience Alignment** - Career progression and level matching
- **Education & Certifications** - Qualification requirements
- **Achievements & Outcomes** - Impact and accomplishment relevance
- **Soft Skills & Culture Fit** - Team dynamics and work environment alignment

### Why ResAlign?

- ⚡ **Smart Analysis** - Goes beyond keyword matching with contextual understanding
- 🎯 **Strategic Insights** - Identify where you excel and where to grow
- ⏱️ **Time Savings** - Focus energy on high-compatibility opportunities
- 📊 **Data-Driven** - Make career decisions based on concrete fit scores
- 🔒 **Privacy First** - Your data is encrypted and never sold

---

## ✨ Key Features

### Core Functionality
- **Resume Analysis** - AI-powered resume parsing and structured data extraction
- **Job Description Processing** - Intelligent job requirement extraction
- **Compatibility Scoring** - Multi-dimensional job fit analysis (0-100 score)
- **Detailed Breakdowns** - Five-category scoring with specific insights
- **Skill Gap Analysis** - Identify missing skills with prioritization
- **Actionable Recommendations** - Personalized career development suggestions

### User Experience
- **Real-Time Analysis** - Results in 5-10 seconds
- **Multiple File Formats** - PDF, DOCX, plain text support
- **Analysis History** - Track and compare multiple analyses
- **Export Capabilities** - Share analysis with mentors and advisors
- **Secure Authentication** - Supabase JWT-based auth
- **Dashboard** - View all analyses and career insights in one place

### Technical Excellence
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Server-Sent Events (SSE)** - Real-time progress streaming
- **Automatic Data Cleanup** - Secure data retention policies
- **API-First Architecture** - RESTful endpoints for future integrations
- **Comprehensive Logging** - Full audit trails and error tracking

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) 0.115.0 - Modern Python web framework
- **Server**: [Uvicorn](https://www.uvicorn.org/) - ASGI server
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL + Auth + Storage
- **AI/ML**: 
  - [Google Gemini](https://ai.google.dev/) - Advanced language model for analysis
  - [Reducto AI](https://www.reducto.ai/) - Document processing and extraction
- **Data Validation**: [Pydantic](https://docs.pydantic.dev/) 2.9.0
- **PDF Processing**: [PyPDF2](https://github.com/py-pdf/PyPDF2)
- **Email**: [Resend](https://resend.com/) - Transactional email
- **Environment**: [python-dotenv](https://github.com/theskumar/python-dotenv)

### Frontend
- **Framework**: [React](https://react.dev/) 18+ with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/) - Lightning-fast build tool
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Animations**: [Motion](https://motion.dev/) - Production-ready animations
- **Backend Client**: [@supabase/supabase-js](https://github.com/supabase/supabase-js)
- **State Management**: React Hooks & Context API
- **HTTP Client**: Browser Fetch API

### DevOps & Infrastructure
- **Version Control**: Git
- **Container Ready**: Docker support (optional)
- **Environment Management**: `.env` files
- **Security**: CORS, JWT, HTTPS ready

---

## 🏗️ Architecture

```
ResAlign AI
├── Frontend (React + TypeScript)
│   ├── Pages: Landing, Login, Signup, Dashboard, Analysis Results, FAQ
│   ├── Components: UI components, Modals, Forms
│   ├── Hooks: Authentication, API calls, File validation
│   └── Services: Supabase client, PDF conversion
│
├── Backend (FastAPI)
│   ├── Routes: Upload, Extract, Analyze, Health
│   ├── Services: 
│   │   ├── LLM Service (Google Gemini)
│   │   ├── Document Processing (Reducto)
│   │   ├── Scoring & Matching
│   │   └── Database Operations (Supabase)
│   └── Utils: Authentication, Extraction helpers
│
└── Infrastructure
    ├── Supabase: Auth, Database, Storage
    ├── Google Gemini API: AI Analysis
    ├── Reducto: PDF Extraction
    └── Resend: Email Delivery
```

---

## 📋 Prerequisites

### System Requirements
- **OS**: macOS, Linux, Windows, or Docker
- **CPU**: Multi-core processor (2+ cores recommended)
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 5GB free space

### Software Requirements

**Backend:**
- Python 3.9 or higher
- pip or conda package manager
- Git

**Frontend:**
- Node.js 18+ and npm 9+
- Git

### API Keys & Services (Required for Production)
- [Supabase](https://supabase.com/) account with project
- [Google Gemini API](https://ai.google.dev/) key
- [Reducto AI](https://www.reducto.ai/) API credentials
- [Resend](https://resend.com/) email service API key

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nikhil-kadapala/resalign-ai.git
cd resalign-ai
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -m pip list | grep -E "fastapi|uvicorn|supabase"
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Verify Node.js version
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 4. Verify Installation

```bash
# Check Python version
python --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# === Core ===
DEBUG=false
APP_NAME="ResAlign AI API"
APP_VERSION="0.1.0"

# === Server ===
HOST=0.0.0.0
PORT=8000
CLIENT_ORIGINS_URL=http://localhost:5173

# === Supabase ===
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=your_storage_bucket_name

# === Reducto AI ===
REDUCTO_API_KEY=your_reducto_api_key
REDUCTO_RES_PIPELINE_ID=your_resume_pipeline_id
REDUCTO_JD_PIPELINE_ID=your_jd_pipeline_id

# === Google Gemini ===
GEMINI_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-flash-latest

# === Resume Processing ===
RESUME_MAX_SIZE_MB=10
RESUME_CLEANUP_HOURS=24

# === Feature Flags ===
USE_GEVAL_SCORING=true
USE_REDUCTO_EXTRACTION=true
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8000
```

### Getting API Keys

1. **Supabase**: Follow [Supabase setup guide](https://supabase.com/docs/guides/getting-started)
2. **Google Gemini**: Get API key from [Google AI Studio](https://ai.google.dev)
3. **Reducto AI**: Sign up at [reducto.ai](https://www.reducto.ai/) for credentials
4. **Resend**: Set up at [resend.com](https://resend.com/)

---

## 🚀 Usage

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python main.py
```

Backend will start at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will start at `http://localhost:5173`

### Accessing the Application

- **Frontend**: http://localhost:5173
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### Basic Workflow

1. **Sign Up/Login** - Create account at http://localhost:5173/signup
2. **Upload Resume** - Go to dashboard and upload your resume PDF
3. **Add Job Description** - Upload JD or paste job description text
4. **Analyze** - Click analyze to get compatibility score
5. **Review Results** - See detailed breakdown across 5 dimensions
6. **Export/Share** - Download analysis or share with mentors

---

## 📡 API Documentation

### Key Endpoints

**Authentication:**
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

**Document Processing:**
- `POST /api/v1/upload` - Upload resume and job description
- `POST /api/v1/extract` - Extract structured data from documents

**Analysis:**
- `POST /api/v1/analyze` - Analyze resume vs job description
- `GET /api/v1/analyses` - Get user's analysis history

**Health:**
- `GET /health` - Service health check

### Interactive API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide interactive API testing and documentation.

---

## 📁 Project Structure

```
resalign-ai/
├── backend/
│   ├── api/
│   │   ├── routes/           # API endpoints
│   │   │   ├── upload.py     # File upload handling
│   │   │   ├── extract.py    # Data extraction
│   │   │   ├── analyze.py    # Analysis endpoint
│   │   │   └── health.py     # Health check
│   │   ├── services/         # Business logic
│   │   │   ├── llm_service.py        # Google Gemini integration
│   │   │   ├── scorer.py             # Scoring logic
│   │   │   ├── matcher.py            # Skill matching
│   │   │   ├── supabase.py           # Database operations
│   │   │   └── reducto.py            # PDF processing
│   │   ├── types/            # Pydantic models
│   │   ├── _utils/           # Utilities
│   │   │   ├── auth.py       # JWT authentication
│   │   │   └── extraction_helpers.py
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI app
│   ├── tests/                # Unit tests
│   ├── requirements.txt      # Python dependencies
│   └── pytest.ini            # Pytest configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   │   ├── Landing.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AnalysisResults.tsx
│   │   │   └── FAQ.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── types/            # TypeScript types
│   │   └── contexts/         # React Context
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript configuration
│
├── docs/                     # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── CONTRIBUTING.md
│
├── .github/
│   └── workflows/            # CI/CD pipelines
│
├── LICENSE                   # MIT License
├── README.md                 # This file
└── DEPLOYMENT_GUIDE.md       # Production deployment

```

---

## 👨‍💻 Development

### Development Setup

```bash
# Backend development mode
cd backend
source venv/bin/activate
pip install -r requirements.txt
# Install dev dependencies if available
pip install pytest pytest-asyncio black flake8 mypy

# Frontend development mode
cd frontend
npm install
npm run dev
```

### Code Quality

**Backend:**
```bash
# Format code
black backend/api/

# Lint code
flake8 backend/api/

# Type checking
mypy backend/api/
```

**Frontend:**
```bash
# Lint TypeScript/JavaScript
npm run lint

# Format code
npm run format
```

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Backend tests with coverage
python -m pytest --cov=api

# Frontend tests
cd frontend
npm test
```

### Common Development Tasks

**Hot Reload:**
- Frontend: Vite automatically hot-reloads on file changes
- Backend: Use `--reload` flag with uvicorn for development

**Database Migrations:**
```bash
# Use Supabase dashboard or CLI for schema changes
supabase migration new <migration_name>
```

**Debugging:**
- Backend: Add `debugpy` for remote debugging
- Frontend: Use browser DevTools and React DevTools

---

## 🚢 Deployment

### Production Checklist

- [ ] Update all environment variables for production
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Review security headers
- [ ] Set up rate limiting
- [ ] Configure CORS appropriately
- [ ] Review privacy policy and legal documents

### Backend Deployment

**Option 1: Traditional Server (Ubuntu/Debian)**
```bash
# Install Python, create venv, install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Use gunicorn or uvicorn with supervisor/systemd
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**Option 2: Docker**
```bash
docker build -t resalign-backend .
docker run -p 8000:8000 --env-file .env resalign-backend
```

**Option 3: Cloud Platforms**
- **Render**: Deploy FastAPI directly
- **Railway**: Zero-config Python deployment
- **Heroku**: Use Procfile for deployment
- **AWS/GCP/Azure**: Using containers or serverless

### Frontend Deployment

**Option 1: Static Hosting**
```bash
# Build for production
npm run build

# Output in dist/ directory - ready for S3, Netlify, Vercel, etc.
```

**Option 2: Vercel (Recommended for React)**
```bash
npm install -g vercel
vercel
```

**Option 3: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows (optional)

### Running Tests

```bash
# All tests
cd backend
python -m pytest

# Specific test file
python -m pytest tests/test_upload_route.py

# With coverage report
python -m pytest --cov=api --cov-report=html

# Verbose output
python -m pytest -v

# Run specific test
python -m pytest tests/test_upload_route.py::test_upload_resume
```

### Test Files
- `tests/test_upload_route.py` - File upload tests
- `tests/test_file_validation.py` - File validation tests
- `tests/test_pdf_converter.py` - PDF conversion tests
- `tests/test_supabase_service.py` - Database operation tests

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/resalign-ai.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow code style conventions
   - Add tests for new features
   - Update documentation

4. **Commit with descriptive messages**
   ```bash
   git commit -m 'Add AmazingFeature with tests and docs'
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Reference related issues
   - Describe changes clearly
   - Request review from maintainers

### Development Guidelines

- **Code Style**: Follow PEP 8 (Python) and Prettier (JavaScript)
- **Naming**: Use clear, descriptive names
- **Comments**: Explain "why" not "what"
- **Tests**: Aim for >80% coverage
- **Documentation**: Update README/docs with changes
- **Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

---

## 🔐 Security

### Security Features

- ✅ **End-to-End Encryption**: HTTPS/TLS for all communications
- ✅ **Data Encryption**: AES-256 encryption at rest
- ✅ **Authentication**: JWT-based with Supabase
- ✅ **Authorization**: Role-based access control
- ✅ **Input Validation**: Pydantic models validate all inputs
- ✅ **CORS Protection**: Configured CORS headers
- ✅ **Rate Limiting**: Ready for rate limiting implementation
- ✅ **Privacy**: No data sharing or selling

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Please email security@alignai.cv with:
- Description of the vulnerability
- Steps to reproduce
- Affected components
- Your contact information

We take security seriously and will respond within 48 hours.

### Privacy & Compliance

- **Privacy Policy**: See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
- **Terms of Service**: See [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md)
- **Cookie Policy**: See [COOKIE_POLICY.md](./COOKIE_POLICY.md)
- **GDPR Compliant**: Full data subject rights support
- **CCPA Compliant**: California consumer privacy rights

---

## 🔧 Troubleshooting

### Common Issues

**Backend Won't Start**
```
Error: Could not connect to Supabase
→ Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
→ Verify Supabase project is active
→ Check internet connection
```

**Frontend Build Fails**
```
Error: Cannot find module
→ Run: npm install
→ Delete node_modules and package-lock.json, reinstall
→ Check Node.js version: node --version (need 18+)
```

**API Key Errors**
```
Error: Invalid API key for Gemini/Reducto
→ Verify API keys in .env are correct
→ Check keys haven't expired
→ Ensure keys have necessary permissions
```

**Database Connection Issues**
```
Error: Failed to connect to database
→ Check SUPABASE_URL format
→ Verify network allows Supabase connection
→ Check firewall/VPN settings
```

**File Upload Fails**
```
Error: File size exceeds limit
→ Files must be under 10MB
→ Check RESUME_MAX_SIZE_MB in .env
→ Verify file format is supported (PDF, DOCX, TXT)
```

### Debug Mode

**Backend:**
```bash
# Enable debug logging
DEBUG=true python main.py
```

**Frontend:**
```bash
# Enable verbose output
npm run dev -- --debug
```

### Getting Help

1. **Check Documentation**: See [docs/](./docs/) folder
2. **Search Issues**: Look for similar problems on GitHub
3. **Open an Issue**: Provide error message, steps to reproduce, environment
4. **Contact Support**: Email support@alignai.cv

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License Summary:**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Liability: Limited
- ⚠️ Warranty: None

---

## 💬 Support

### Get Help

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](../../issues)
- **Email**: support@alignai.cv
- **Twitter**: [@ResAlignAI](https://twitter.com/resalignai)
- **LinkedIn**: [ResAlign AI](https://linkedin.com/company/resalignai)

### Stay Updated

- 🌟 Star this repository for updates
- 👀 Watch for releases
- 📧 Subscribe to newsletter (coming soon)

---

## 🙏 Acknowledgments

### Built With

- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [React](https://react.dev/) - UI library
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool

### Contributors

Thanks to all contributors who have helped with code, bug reports, and suggestions!

### Inspiration

ResAlign AI was inspired by the career development challenges faced by job seekers and the need for intelligent, data-driven career decisions.

---

## 📊 Project Status

- **Status**: 🚀 In Active Development
- **Current Version**: 0.1.0
- **Last Updated**: 2025-01-27

### Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Interview preparation module
- [ ] Salary negotiation tools
- [ ] Skill development plans
- [ ] Company culture matching
- [ ] Advanced analytics dashboard

---

<div align="center">

### Made with ❤️ by the ResAlign AI team

[GitHub](https://github.com/nikhil-kadapala/resalign-ai) • [Twitter](https://twitter.com/resalignai) • [Email](mailto:support@alignai.cv)

**Ready to align your career? [Get started now →](http://localhost:5173)**

</div>
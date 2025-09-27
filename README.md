# Task Manager Application

A modern, full-stack task management application built with Spring Boot and Angular, designed for the Veri Platform technical assessment.

## 🌐 Live Demo

**Application**: [https://veri-assessment.tinashe.website](https://veri-assessment.tinashe.website)
**API Health**: [https://veri-assessment.tinashe.website/actuator/health](https://veri-assessment.tinashe.website/actuator/health)

## 📋 Overview

This is a single-user task management application that allows users to:
- **Register** and **login** with secure JWT authentication
- **Create, read, update, and delete** tasks
- **Toggle task status** between PENDING and COMPLETED
- **Manage personal tasks** with user isolation
- **Access via modern, responsive UI** with Angular Material Design

## 🏗️ Architecture

### Tech Stack
- **Backend**: Spring Boot 2.7.18 (Java 11)
- **Frontend**: Angular 16+ with TypeScript
- **Database**: H2 In-Memory (Development/Production)
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Angular Material
- **Containerization**: Docker & Docker Compose
- **Deployment**: AWS EC2 with Nginx reverse proxy
- **SSL**: Let's Encrypt certificate

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Angular UI    │────│  Nginx Proxy    │────│  Spring Boot    │
│   (Port 3000)   │    │   (Port 443)    │    │   (Port 8080)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────────────┐
                                              │                 │
                                              │  H2 Database    │
                                              │   (In-Memory)   │
                                              │                 │
                                              └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Java 11+**
- **Node.js 18+**
- **Docker & Docker Compose** (for containerized setup)

### Option 1: Local Development

#### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
# Backend will run on http://localhost:8080
```

#### Frontend Setup
```bash
cd frontend
npm install
ng serve
# Frontend will run on http://localhost:4200
```

### Option 2: Docker Setup (Recommended)

#### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production Environment
```bash
# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# Or use the deployment script
./deploy.sh
```

## 📡 API Documentation

### Authentication Endpoints (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Task Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user's tasks |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/{id}` | Get single task by ID |
| PUT | `/api/tasks/{id}` | Update existing task |
| DELETE | `/api/tasks/{id}` | Delete task |

### Example API Usage

#### Register User
```bash
curl -X POST https://veri-assessment.tinashe.website/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

#### Login
```bash
curl -X POST https://veri-assessment.tinashe.website/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

#### Create Task (Requires JWT)
```bash
curl -X POST https://veri-assessment.tinashe.website/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Complete assessment", "description": "Finish the task manager app"}'
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `SPRING_PROFILES_ACTIVE`: Set to `docker` or `prod`
- `SERVER_PORT`: Port for Spring Boot (default: 8080)
- `DOMAIN_NAME`: Your domain name for production

#### Frontend
- `API_URL`: Backend API URL (auto-configured based on environment)

### Database Configuration
- **Development**: H2 in-memory database
- **Console**: Available at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: (empty)

## 🐳 Docker Details

### Multi-Stage Builds
- **Backend**: Uses OpenJDK 11, Maven for building, optimized JRE runtime
- **Frontend**: Uses Node.js 22 for building, http-server for serving

### Container Configuration
- **Backend Container**: `task-manager-backend-prod` (Port 8080)
- **Frontend Container**: `task-manager-frontend-prod` (Port 3000)
- **Health Checks**: Automatic container health monitoring
- **Restart Policy**: `unless-stopped` for production reliability

## 🌐 Deployment

### AWS EC2 Deployment
- **Instance**: 3.20.15.201
- **Domain**: veri-assessment.tinashe.website
- **SSL**: Let's Encrypt certificate with automatic renewal
- **Reverse Proxy**: Nginx configuration for frontend and API routing

### Deployment Steps
1. **Clone repository** on EC2 instance
2. **Run deployment script**: `./deploy.sh`
3. **Configure Nginx** with provided configuration
4. **Set up SSL** with certbot
5. **Monitor health** via health endpoints

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration works
- [ ] User login generates JWT token
- [ ] Task creation, editing, deletion work
- [ ] Task status toggle (PENDING ↔ COMPLETED)
- [ ] User isolation (users only see their tasks)
- [ ] Authentication persists across browser sessions
- [ ] Responsive UI works on mobile/desktop
- [ ] API endpoints respond correctly
- [ ] Docker containers start and run healthily

### API Health Checks
- **Backend Health**: `GET /actuator/health`
- **Frontend Health**: `GET /health`

## 🔒 Security Features

- **Password Hashing**: BCrypt with salt
- **JWT Authentication**: Stateless token-based auth
- **Route Protection**: Frontend route guards
- **API Security**: Protected endpoints require valid JWT
- **User Isolation**: Users can only access their own data
- **CORS Configuration**: Properly configured for frontend integration
- **HTTPS**: SSL certificate for secure communication

## 📁 Project Structure

```
task_manager/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/veri/taskmanager/
│   │   ├── config/            # Security, CORS, JWT config
│   │   ├── controller/        # REST endpoints
│   │   ├── model/             # Entity classes (User, Task)
│   │   ├── repository/        # JPA repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT utilities, filters
│   │   └── dto/               # Request/Response objects
│   ├── Dockerfile             # Backend container config
│   └── pom.xml                # Maven dependencies
├── frontend/                  # Angular application
│   ├── src/app/
│   │   ├── auth/              # Login, Register components + AuthService
│   │   ├── dashboard/         # Main dashboard
│   │   ├── layout/            # Header, sidebar components
│   │   ├── pages/             # Task management pages
│   │   └── models/            # TypeScript interfaces
│   ├── Dockerfile             # Frontend container config
│   └── package.json           # npm dependencies
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
├── deploy.sh                  # Production deployment script
├── DOCKER.md                  # Docker documentation
└── README.md                  # This file
```

## 🏆 Assessment Highlights

### Functionality ✅
- Complete CRUD operations for tasks
- Secure JWT authentication system
- User registration and login
- Task status management
- Responsive, modern UI

### Code Quality ✅
- Clean, maintainable code structure
- Proper separation of concerns
- Spring Boot and Angular best practices
- TypeScript for type safety
- Professional error handling

### Security ✅
- BCrypt password hashing
- JWT token authentication
- Protected API routes
- User data isolation
- CORS properly configured

### DevOps ✅
- Dockerized full-stack application
- Production deployment on AWS
- SSL certificate configuration
- Health monitoring endpoints
- Professional documentation

## 📞 Support & Contact

For questions about this implementation:
- **GitHub Repository**: [veri_task_manager_assessment](https://github.com/TinasheMuchabaiwa/veri_task_manager_assessment)
- **Live Application**: [https://veri-assessment.tinashe.website](https://veri-assessment.tinashe.website)

---

**Built with ❤️ for Veri Platform Technical Assessment**
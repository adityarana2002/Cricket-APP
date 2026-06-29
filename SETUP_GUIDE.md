# Cricket App - Complete Setup Guide

## 📁 Project Structure

```
Cricket App/
├── frontend/                          # React.js Website (Port 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/               # React Components
│   │   ├── pages/                    # Page Components
│   │   ├── services/                 # API Service (axios)
│   │   ├── store/                    # Redux State Management
│   │   ├── hooks/                    # Custom React Hooks
│   │   ├── utils/                    # Utility Functions
│   │   ├── styles/                   # CSS Styles
│   │   ├── App.tsx                   # Main App Component
│   │   ├── index.tsx                 # Entry Point
│   │   └── index.css                 # Global Styles
│   ├── package.json                  # npm Dependencies
│   ├── tsconfig.json                 # TypeScript Config
│   ├── tailwind.config.js            # Tailwind CSS Config
│   ├── .env.example                  # Environment Variables Example
│   └── .gitignore
│
├── backend/                           # Spring Boot API (Port 8080)
│   ├── src/main/
│   │   ├── java/com/cricketapp/
│   │   │   ├── CricketAppApplication.java    # Main Class
│   │   │   ├── config/               # Configuration Classes
│   │   │   ├── controller/           # REST Controllers
│   │   │   ├── service/              # Business Logic
│   │   │   ├── repository/           # Data Access
│   │   │   ├── entity/               # JPA Entities
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   ├── security/             # Security & JWT
│   │   │   ├── websocket/            # WebSocket Handlers
│   │   │   ├── exception/            # Exception Handlers
│   │   │   └── util/                 # Utility Classes
│   │   └── resources/
│   │       ├── application.properties          # Default Config
│   │       ├── application-dev.properties     # Dev Config
│   │       └── application-prod.properties    # Prod Config
│   ├── pom.xml                       # Maven Dependencies
│   ├── Dockerfile                    # Docker Image
│   ├── README.md                     # Backend Documentation
│   └── .gitignore
│
├── docker-compose.yml                # Docker Compose (PostgreSQL + Redis + Backend)
├── Planning.md                       # Feature Planning Document
├── Java_Implementation_Plan.md       # Backend Technical Design
├── Website_Development_Guide.md      # Frontend Development Guide
├── Backend_Reusability_Guide.md      # Architecture Decision
├── Cricket_Flow_Diagrams_V2.html     # System Flow Diagrams
└── SETUP_GUIDE.md                    # This File
```

---

## 🚀 Quick Start (5 minutes)

### Option 1: Using Docker (Recommended for Testing)

```bash
# Start everything at once
docker-compose up -d

# Check services
docker-compose ps

# Stop services
docker-compose down
```

Then:
- Backend will be running on: `http://localhost:8080`
- PostgreSQL on: `localhost:5432`
- Redis on: `localhost:6379`

### Option 2: Manual Setup (for Development)

---

## 📦 Backend Setup (Java/Spring Boot)

### Prerequisites (LTS Versions)
- Java 21 LTS (Latest Long Term Support)
- Maven 3.8.1+ (Latest Stable)
- PostgreSQL 15/16 LTS (Stable Long Term Support)
- Redis 7.x LTS (Current Stable)

### Installation Steps

#### 1. **Install Java 21 LTS**
```bash
# Download from https://www.oracle.com/java/technologies/downloads/
# Select: Java 21 LTS (Latest LTS - Supported until Sept 2031)
# Or use Chocolatey (Windows)
choco install openjdk21

# Verify installation
java -version
# Should show: Java 21.x.x (LTS)
```

#### 2. **Install Maven**
```bash
# Windows (Chocolatey)
choco install maven

# Verify installation
mvn -version
```

#### 3. **Install PostgreSQL 15/16 LTS**
```bash
# Windows Installer: https://www.postgresql.org/download/windows/
# Download: PostgreSQL 15 (LTS) or PostgreSQL 16 (Latest)
# Or use Chocolatey
choco install postgresql15
# OR
choco install postgresql16

# After installation, verify version
psql --version
# Should show: psql (PostgreSQL) 15.x or 16.x

# Create database
# Username: postgres
# Password: postgres (or your choice)
```

#### 4. **Install Redis**
```bash
# Windows (Chocolatey)
choco install redis

# Start Redis
redis-server

# Or use WSL2/Docker
docker run -d -p 6379:6379 redis:7-alpine
```

#### 5. **Configure Backend**

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/cricket_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# Redis
spring.redis.host=localhost
spring.redis.port=6379
```

#### 6. **Build and Run Backend**

```bash
# Navigate to backend
cd backend

# Build project
mvn clean install

# Run development server
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Backend runs on http://localhost:8080
```

---

## 💻 Frontend Setup (React.js)

### Prerequisites
- Node.js 16+ and npm 8+
- React 18.x
- TypeScript 5.x

### Installation Steps

#### 1. **Install Node.js and npm**
```bash
# Download from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### 2. **Install Frontend Dependencies**

```bash
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# This installs:
# - React 18
# - TypeScript
# - Tailwind CSS
# - Redux
# - Axios
# - React Router
# - All other dependencies
```

#### 3. **Create Environment File**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_VERSION=v1
REACT_APP_WS_URL=ws://localhost:8080
```

#### 4. **Run Development Server**

```bash
# Navigate to frontend directory
cd frontend

# Start React app
npm start

# Frontend runs on http://localhost:3000
```

---

## ⚙️ Technology Stack Summary (LTS Stable)

### Frontend (Website)
| Technology | Version | LTS Status | Support Until |
|-----------|---------|-----------|---------------| 
| React | 18.2.0 | ✅ Stable | 2025+ |
| TypeScript | 5.4.5 | ✅ Stable | 2025+ |
| Tailwind CSS | 3.4.3 | ✅ Latest | Current |
| Redux | 8.1.3 | ✅ Stable | 2025+ |
| Axios | 1.7.2 | ✅ Stable | 2025+ |
| React Router | 6.23.0 | ✅ Stable | Current |
| Node.js | 20 LTS | ✅ LTS | April 2026 |

### Backend (API Server)
| Technology | Version | LTS Status | Support Until |
|-----------|---------|-----------|---------------| 
| Java | 21 LTS | ✅ LTS | Sept 2031 |
| Spring Boot | 3.2.4 | ✅ LTS | Sept 2027 |
| Spring Security | 6.2.x | ✅ LTS | Sept 2027 |
| JWT (JJWT) | 0.12.x | ✅ Stable | Current |
| PostgreSQL | 15/16 LTS | ✅ LTS | 2024-2026 |
| Redis | 7.x | ✅ LTS | Current |
| Maven | 3.8.1+ | ✅ Stable | Current |

### Database
| Component | Version | Port | LTS Status |
|-----------|---------|------|-----------|
| PostgreSQL | 15/16 LTS | 5432 | ✅ Long Term Support |
| Redis | 7.x | 6379 | ✅ Stable |

---

## 📋 Development Workflow

### 1. **Daily Development**

```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Database (if not using Docker)
redis-server
```

### 2. **Run Tests**

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

### 3. **Build for Production**

```bash
# Backend - Create JAR
cd backend
mvn clean package

# Frontend - Create Optimized Build
cd frontend
npm run build
```

---

## 🔧 API Endpoints (Backend)

All endpoints are prefixed with `/api/v1`

### Health Check
```
GET /health
Response: "Cricket App Backend is Running!"
```

### Authentication (To be implemented)
```
POST /auth/register          - Register new user
POST /auth/login             - Login user
POST /auth/refresh-token     - Refresh JWT token
POST /auth/logout            - Logout user
```

### Matches (To be implemented)
```
GET /matches                 - List all matches
GET /matches/{id}            - Get match details
POST /matches                - Create match
GET /matches/{id}/scorecard  - Get scorecard
```

See `Java_Implementation_Plan.md` for complete API specification.

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
cd backend
docker build -t cricket-app-backend:latest .
```

### Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services in Docker Compose
- **PostgreSQL**: `cricket-postgres` (5432)
- **Redis**: `cricket-redis` (6379)
- **Backend**: `cricket-backend` (8080)

---

## 📝 Configuration Files

### Frontend Configuration
- `.env` - Environment variables (API URLs, WS URLs)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `package.json` - npm dependencies

### Backend Configuration
- `application.properties` - Default configuration
- `application-dev.properties` - Development overrides
- `application-prod.properties` - Production overrides
- `pom.xml` - Maven dependencies

### Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_VERSION=v1
REACT_APP_WS_URL=ws://localhost:8080
```

**Backend (application.properties)**
```
spring.datasource.url=jdbc:postgresql://localhost:5432/cricket_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.redis.host=localhost
spring.redis.port=6379
jwt.secret=your-secret-key
```

---

## 🔍 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill process using port 8080 (Windows)
taskkill /PID <PID> /F

# Check database connection
# Verify PostgreSQL is running and accessible
psql -U postgres -d cricket_db -h localhost
```

### Frontend Won't Start
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Delete node_modules and package-lock.json
rm -r node_modules package-lock.json
npm install
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### CORS Issues
Update `backend/src/main/resources/application.properties`:
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:3001
```

---

## 📚 Documentation Files

1. **Planning.md** - Feature planning and scope
2. **Java_Implementation_Plan.md** - Backend technical architecture
3. **Website_Development_Guide.md** - Frontend development guide
4. **Backend_Reusability_Guide.md** - Architecture decisions
5. **Cricket_Flow_Diagrams_V2.html** - System flow diagrams
6. **backend/README.md** - Backend-specific documentation

---

## 🎯 Next Steps

1. ✅ **Setup Backend**
   - [ ] Install Java 17
   - [ ] Install Maven
   - [ ] Install PostgreSQL
   - [ ] Install Redis
   - [ ] Configure application.properties
   - [ ] Run `mvn clean install`
   - [ ] Run backend server

2. ✅ **Setup Frontend**
   - [ ] Install Node.js
   - [ ] Run `npm install`
   - [ ] Create `.env` file
   - [ ] Run `npm start`

3. **Development**
   - [ ] Implement authentication endpoints
   - [ ] Create database schema
   - [ ] Build React components
   - [ ] Integrate API endpoints
   - [ ] Implement WebSocket real-time features

---

## 💡 Tips for Development

1. **Use VS Code Extensions**
   - ES7+ React/Redux/React-Native Snippets
   - Thunder Client (for API testing)
   - PostgreSQL Explorer
   - Redis Explorer

2. **Keep Terminals Open**
   - Terminal 1: Backend (mvn spring-boot:run)
   - Terminal 2: Frontend (npm start)
   - Terminal 3: Logs/Database commands

3. **Hot Reload**
   - Frontend: Changes auto-reload (npm start)
   - Backend: Use Spring Boot DevTools or rebuild

4. **API Testing**
   - Use Postman or Thunder Client
   - Test endpoints before frontend integration

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review documentation files
3. Check error logs (backend: `logs/` folder)
4. Review browser console (frontend: F12)

---

**Last Updated**: 2024
**Project**: Cricket App
**Status**: Development Setup Complete ✅

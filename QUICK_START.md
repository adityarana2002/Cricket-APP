# 🎯 Cricket App - Quick Start Guide

## ✅ Prerequisites Installed

- ✅ Java 21 LTS
- ✅ Maven 3.9
- ✅ Node.js 20 LTS
- ✅ PostgreSQL 15/16 LTS
- ✅ Redis 7.x (Optional)

Verify:
```bash
java -version          # Should show Java 21
mvn -version          # Should show Maven 3.9
node --version        # Should show v20.x
psql --version        # Should show PostgreSQL 15/16
```

---

## 🚀 Step 1: Database Setup (10 minutes)

### 1.1 Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cricket_db;

# Exit
\q
```

### 1.2 Run Schema
```bash
# Navigate to project
cd "p:\Cricket App"

# Run schema SQL
psql -U postgres -d cricket_db -f backend/src/main/resources/db/schema.sql

# Verify tables
psql -U postgres -d cricket_db
\dt
```

---

## 🔧 Step 2: Backend Setup (15 minutes)

### 2.1 Navigate to Backend
```bash
cd "p:\Cricket App\backend"
```

### 2.2 Update Dependencies

Edit `pom.xml` and add to `<dependencies>` section:

```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT (JJWT) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.1</version>
    <scope>runtime</scope>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Spring Data Redis (Optional) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Jedis (Redis Client) -->
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
</dependency>
```

### 2.3 Build Backend
```bash
mvn clean install
# Takes 3-5 minutes first time
```

### 2.4 Run Backend
```bash
mvn spring-boot:run
# Should see: Started CricketAppApplication in X.XXX seconds
# Backend ready on http://localhost:8080/api
```

**Keep this terminal open!**

---

## 💻 Step 3: Frontend Setup (10 minutes)

### 3.1 Open New Terminal & Navigate
```bash
cd "p:\Cricket App\frontend"
```

### 3.2 Install Dependencies
```bash
npm install
# Takes 2-3 minutes
```

### 3.3 Start Frontend
```bash
npm start
# Should open browser at http://localhost:3000
```

**Keep this terminal open!**

---

## 🧪 Step 4: Test the Application (5 minutes)

### 4.1 Register New Account
1. Open http://localhost:3000
2. Click "Register"
3. Fill in form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
   - Country: India
4. Click "Register"
5. Should redirect to dashboard

### 4.2 Login
1. Go to http://localhost:3000/login
2. Enter:
   - Email: test@example.com
   - Password: password123
3. Click "Login"
4. Should show dashboard

### 4.3 Test Backend Health
```bash
# In new terminal
curl http://localhost:8080/api/v1/health

# Should return: "Cricket App Backend is Running!"
```

---

## 📊 Verify Everything Works

### Backend ✅
- [ ] mvn builds without errors
- [ ] Application starts successfully
- [ ] Health endpoint responds: http://localhost:8080/api/v1/health
- [ ] Logs show Spring Boot started

### Database ✅
- [ ] PostgreSQL running
- [ ] cricket_db created
- [ ] 13 tables visible in pgAdmin or psql
- [ ] Users table has test account

### Frontend ✅
- [ ] npm install completes without major warnings
- [ ] Frontend starts on http://localhost:3000
- [ ] Home page loads with 🏏 Cricket App header
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard displays user info

---

## 🎯 What's Working Now

| Feature | Status |
|---------|--------|
| User Registration | ✅ Working |
| User Login | ✅ Working |
| JWT Authentication | ✅ Working |
| Database Schema | ✅ Created |
| Dashboard | ✅ Ready |
| API Server | ✅ Running |
| Frontend UI | ✅ Ready |

---

## 📈 Next Features to Build

1. **Matches Management** (30 min)
   - Create match endpoint
   - List matches page
   - Match details

2. **Teams Management** (30 min)
   - Create team endpoint
   - Teams list page
   - Team management

3. **Players Management** (45 min)
   - Add players to teams
   - Player profiles
   - Player statistics

4. **Match Scoring** (1 hour)
   - Ball-by-ball scoring
   - Live updates
   - Innings management

5. **Leaderboards** (45 min)
   - Player rankings
   - Team rankings
   - Statistics

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check Java version
java -version

# Kill existing process on 8080
lsof -ti:8080 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :8080   # Windows

# Try with debug
mvn spring-boot:run -X
```

### Frontend errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
```

### Database connection failed
```bash
# Check PostgreSQL running
psql -U postgres -c "SELECT 1"

# Verify credentials in application.properties
# Default: username=postgres, password=postgres
```

### Port conflicts
- Backend on 8080: `java -Dserver.port=8081 -jar app.jar`
- Frontend on 3000: `PORT=3001 npm start`

---

## 📚 Documentation References

- [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) - Detailed progress
- [LTS_VERSIONS_VERIFIED.md](LTS_VERSIONS_VERIFIED.md) - Version info
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
- [backend/README.md](backend/README.md) - Backend docs
- [Planning.md](Planning.md) - Feature planning

---

## 💡 Useful Commands

### Backend
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Run tests
mvn test

# Package
mvn package

# View logs
tail -f target/spring.log
```

### Frontend
```bash
# Install
npm install

# Start
npm start

# Build production
npm run build

# Run tests
npm test

# Format code
npm run format
```

### Database
```bash
# Connect
psql -U postgres -d cricket_db

# List tables
\dt

# Show schema
\d users

# Quit
\q
```

---

**Status**: 🟢 **READY TO USE**  
**Time to Setup**: 30-45 minutes  
**Support**: See SETUP_GUIDE.md or IMPLEMENTATION_PROGRESS.md

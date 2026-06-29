# Cricket App - Java Implementation Plan

## Overview
Complete planning and implementation guide for building a Cricket App using **Java** as the backend technology with modern frameworks and best practices.

---

## 1. Technology Stack

### 1.1 Backend Framework
- **Spring Boot 3.x** - Main framework for REST API
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database ORM
- **Spring Cloud** - Microservices (optional, for scalability)

### 1.2 Web Server
- **Apache Tomcat** (embedded in Spring Boot)
- **Netty** (for async operations)

### 1.3 Database
- **PostgreSQL** - Primary relational database
  - Version: 14+
  - Connection pooling: HikariCP
  - Schema management: Flyway/Liquibase

- **Redis** - Caching and real-time features
  - Version: 7.x+
  - Use cases: Session storage, live scoreboards, leaderboards
  - Client: Jedis or Lettuce

### 1.4 Real-time Communication
- **WebSocket** (Spring WebSocket + STOMP)
  - For live match updates
  - Ball-by-ball scoring
  - Live notifications

### 1.5 Message Queue
- **RabbitMQ** or **Apache Kafka**
  - Asynchronous notifications
  - Event-driven architecture
  - Match updates broadcasting

### 1.6 API Documentation
- **Swagger/OpenAPI 3.0**
- **SpringFox** or **Springdoc-openapi**

### 1.7 Testing
- **JUnit 5** - Unit testing
- **Mockito** - Mocking framework
- **TestContainers** - Integration testing with Docker
- **REST Assured** - API testing

### 1.8 Build Tool
- **Maven 3.8+** or **Gradle 7.x+**

### 1.9 CI/CD
- **Jenkins**, **GitLab CI**, or **GitHub Actions**
- **Docker** - Containerization
- **Kubernetes** - Orchestration (optional)

### 1.10 Monitoring & Logging
- **Log4j2** or **Logback** - Logging
- **Prometheus** - Metrics collection
- **Grafana** - Dashboard visualization
- **ELK Stack** (Elasticsearch, Logstash, Kibana) - Centralized logging

### 1.11 Security
- **Spring Security** - Authentication/Authorization
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **OWASP** - Security best practices

### 1.12 File Storage
- **AWS S3** or **MinIO** - Image/video storage
- **Cloud Storage SDKs**

---

## 2. Project Structure

```
cricket-app/
│
├── backend/
│   ├── cricket-api/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/
│   │   │   │   │   └── com/
│   │   │   │   │       └── cricketapp/
│   │   │   │   │           ├── CricketAppApplication.java
│   │   │   │   │           ├── config/
│   │   │   │   │           │   ├── SecurityConfig.java
│   │   │   │   │           │   ├── WebSocketConfig.java
│   │   │   │   │           │   ├── CorsConfig.java
│   │   │   │   │           │   └── JacksonConfig.java
│   │   │   │   │           ├── controller/
│   │   │   │   │           │   ├── AuthController.java
│   │   │   │   │           │   ├── MatchController.java
│   │   │   │   │           │   ├── TeamController.java
│   │   │   │   │           │   ├── PlayerController.java
│   │   │   │   │           │   ├── UserController.java
│   │   │   │   │           │   ├── TournamentController.java
│   │   │   │   │           │   ├── StatisticsController.java
│   │   │   │   │           │   └── LeaderboardController.java
│   │   │   │   │           ├── service/
│   │   │   │   │           │   ├── AuthService.java
│   │   │   │   │           │   ├── MatchService.java
│   │   │   │   │           │   ├── MatchScoringService.java
│   │   │   │   │           │   ├── TeamService.java
│   │   │   │   │           │   ├── PlayerService.java
│   │   │   │   │           │   ├── UserService.java
│   │   │   │   │           │   ├── TournamentService.java
│   │   │   │   │           │   ├── StatisticsService.java
│   │   │   │   │           │   ├── NotificationService.java
│   │   │   │   │           │   ├── LeaderboardService.java
│   │   │   │   │           │   └── EmailService.java
│   │   │   │   │           ├── repository/
│   │   │   │   │           │   ├── UserRepository.java
│   │   │   │   │           │   ├── MatchRepository.java
│   │   │   │   │           │   ├── TeamRepository.java
│   │   │   │   │           │   ├── PlayerRepository.java
│   │   │   │   │           │   ├── TournamentRepository.java
│   │   │   │   │           │   ├── BallRepository.java
│   │   │   │   │           │   ├── ScoreRepository.java
│   │   │   │   │           │   └── NotificationRepository.java
│   │   │   │   │           ├── entity/
│   │   │   │   │           │   ├── User.java
│   │   │   │   │           │   ├── Match.java
│   │   │   │   │           │   ├── Team.java
│   │   │   │   │           │   ├── Player.java
│   │   │   │   │           │   ├── Tournament.java
│   │   │   │   │           │   ├── BallInfo.java
│   │   │   │   │           │   ├── Score.java
│   │   │   │   │           │   ├── Notification.java
│   │   │   │   │           │   ├── Venue.java
│   │   │   │   │           │   ├── Role.java
│   │   │   │   │           │   └── Permission.java
│   │   │   │   │           ├── dto/
│   │   │   │   │           │   ├── AuthDTO.java
│   │   │   │   │           │   ├── UserDTO.java
│   │   │   │   │           │   ├── MatchDTO.java
│   │   │   │   │           │   ├── TeamDTO.java
│   │   │   │   │           │   ├── PlayerDTO.java
│   │   │   │   │           │   ├── ScoreDTO.java
│   │   │   │   │           │   ├── TournamentDTO.java
│   │   │   │   │           │   ├── LeaderboardDTO.java
│   │   │   │   │           │   └── StatisticsDTO.java
│   │   │   │   │           ├── exception/
│   │   │   │   │           │   ├── CustomException.java
│   │   │   │   │           │   ├── ResourceNotFoundException.java
│   │   │   │   │           │   ├── UnauthorizedException.java
│   │   │   │   │           │   ├── BadRequestException.java
│   │   │   │   │           │   └── GlobalExceptionHandler.java
│   │   │   │   │           ├── security/
│   │   │   │   │           │   ├── JwtTokenProvider.java
│   │   │   │   │           │   ├── CustomUserDetailsService.java
│   │   │   │   │           │   ├── JwtAuthenticationFilter.java
│   │   │   │   │           │   └── SecurityUtil.java
│   │   │   │   │           ├── websocket/
│   │   │   │   │           │   ├── WebSocketEventListener.java
│   │   │   │   │           │   ├── LiveScoreController.java
│   │   │   │   │           │   └── NotificationHandler.java
│   │   │   │   │           ├── util/
│   │   │   │   │           │   ├── ResponseUtil.java
│   │   │   │   │           │   ├── ValidationUtil.java
│   │   │   │   │           │   ├── DateUtil.java
│   │   │   │   │           │   └── Constants.java
│   │   │   │   │           └── mapper/
│   │   │   │   │               ├── UserMapper.java
│   │   │   │   │               ├── MatchMapper.java
│   │   │   │   │               ├── TeamMapper.java
│   │   │   │   │               ├── PlayerMapper.java
│   │   │   │   │               └── TournamentMapper.java
│   │   │   │   └── resources/
│   │   │   │       ├── application.properties
│   │   │   │       ├── application-dev.properties
│   │   │   │       ├── application-prod.properties
│   │   │   │       └── application-test.properties
│   │   │   │
│   │   │   └── test/
│   │   │       ├── java/
│   │   │       │   └── com/
│   │   │       │       └── cricketapp/
│   │   │       │           ├── controller/
│   │   │       │           │   ├── AuthControllerTest.java
│   │   │       │           │   ├── MatchControllerTest.java
│   │   │       │           │   └── ...
│   │   │       │           ├── service/
│   │   │       │           │   ├── AuthServiceTest.java
│   │   │       │           │   ├── MatchServiceTest.java
│   │   │       │           │   └── ...
│   │   │       │           └── repository/
│   │   │       │               └── ...
│   │   │       └── resources/
│   │   │           └── test-data.sql
│   │   │
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── .env.example
│   │
│   └── scripts/
│       ├── db/
│       │   ├── migration/
│       │   │   ├── V1__create_initial_schema.sql
│       │   │   ├── V2__create_users_table.sql
│       │   │   ├── V3__create_teams_table.sql
│       │   │   └── ...
│       │   └── init.sql
│       │
│       └── setup/
│           ├── setup.sh
│           └── setup.bat
│
├── frontend/
│   ├── web/
│   │   └── [React/Vue.js project]
│   │
│   └── mobile/
│       ├── android/
│       └── ios/
│
├── docs/
│   ├── API_Documentation.md
│   ├── Database_Schema.md
│   ├── Architecture.md
│   └── Deployment.md
│
├── docker-compose.yml
└── README.md
```

---

## 3. Maven POM Configuration

### 3.1 Dependencies

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <spring-boot.version>3.1.0</spring-boot.version>
    <spring-cloud.version>2022.0.3</spring-cloud.version>
</properties>

<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
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
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    
    <!-- WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Swagger/OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.0.2</version>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- MapStruct for DTOs -->
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.3.Final</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- Test Containers -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers</artifactId>
        <version>1.18.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 4. Database Design

### 4.1 Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    phone_number VARCHAR(20),
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    city VARCHAR(50),
    country VARCHAR(50),
    admin_id INTEGER REFERENCES users(id),
    founded_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    team_id INTEGER REFERENCES teams(id),
    jersey_number INTEGER,
    player_role VARCHAR(50), -- BATSMAN, BOWLER, FIELDER, ALL_ROUNDER, WICKET_KEEPER
    batting_style VARCHAR(50), -- RIGHT_HANDED, LEFT_HANDED
    bowling_style VARCHAR(50),
    playing_experience_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_name VARCHAR(100),
    team_1_id INTEGER REFERENCES teams(id),
    team_2_id INTEGER REFERENCES teams(id),
    match_type VARCHAR(50), -- T20, ODI, TEST, FRIENDLY
    match_format VARCHAR(50), -- INNINGS, OVER_BASED
    venue_id INTEGER REFERENCES venues(id),
    scheduled_date TIMESTAMP,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    match_status VARCHAR(50), -- SCHEDULED, LIVE, COMPLETED, ABANDONED
    toss_winner_id INTEGER REFERENCES teams(id),
    toss_decision VARCHAR(50), -- BAT, FIELD
    total_overs INTEGER,
    balls_per_over INTEGER DEFAULT 6,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues Table
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50),
    capacity INTEGER,
    pitch_type VARCHAR(50),
    home_team_id INTEGER REFERENCES teams(id),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Innings Table
CREATE TABLE innings (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    innings_number INTEGER,
    batting_team_id INTEGER REFERENCES teams(id),
    bowling_team_id INTEGER REFERENCES teams(id),
    total_runs INTEGER,
    total_wickets INTEGER,
    total_overs DECIMAL(4,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ball Information Table
CREATE TABLE ball_info (
    id SERIAL PRIMARY KEY,
    innings_id INTEGER REFERENCES innings(id),
    over_number INTEGER,
    ball_number INTEGER,
    batsman_id INTEGER REFERENCES players(id),
    bowler_id INTEGER REFERENCES players(id),
    fielder_id INTEGER REFERENCES players(id),
    runs_on_ball INTEGER,
    extra_runs INTEGER,
    extra_type VARCHAR(50), -- WIDE, NO_BALL, BYE, LEG_BYE
    is_wicket BOOLEAN DEFAULT FALSE,
    wicket_type VARCHAR(50), -- BOWLED, LBW, CAUGHT, RUN_OUT, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments Table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    tournament_type VARCHAR(50), -- LEAGUE, KNOCKOUT, GROUP
    location VARCHAR(100),
    organizer_id INTEGER REFERENCES users(id),
    total_teams INTEGER,
    prize_pool DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboards Table
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    team_id INTEGER REFERENCES teams(id),
    matches_played INTEGER,
    wins INTEGER,
    losses INTEGER,
    points INTEGER,
    net_run_rate DECIMAL(10,2),
    position INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Statistics Tables

```sql
-- Batting Statistics
CREATE TABLE batting_statistics (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    match_id INTEGER REFERENCES matches(id),
    runs_scored INTEGER,
    balls_faced INTEGER,
    fours_count INTEGER,
    sixes_count INTEGER,
    strike_rate DECIMAL(10,2),
    dismissal_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bowling Statistics
CREATE TABLE bowling_statistics (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    match_id INTEGER REFERENCES matches(id),
    overs_bowled DECIMAL(4,1),
    runs_conceded INTEGER,
    wickets_taken INTEGER,
    economy_rate DECIMAL(10,2),
    dot_balls INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API Endpoints Structure

### 5.1 Authentication APIs
```
POST   /api/v1/auth/register       - User registration
POST   /api/v1/auth/login          - User login
POST   /api/v1/auth/logout         - User logout
POST   /api/v1/auth/refresh-token  - Refresh JWT token
GET    /api/v1/auth/verify-email   - Email verification
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password  - Reset password
```

### 5.2 User APIs
```
GET    /api/v1/users/{userId}      - Get user profile
PUT    /api/v1/users/{userId}      - Update user profile
DELETE /api/v1/users/{userId}      - Delete user account
GET    /api/v1/users/search        - Search users
POST   /api/v1/users/{userId}/follow - Follow user
POST   /api/v1/users/{userId}/unfollow - Unfollow user
```

### 5.3 Match APIs
```
POST   /api/v1/matches             - Create match
GET    /api/v1/matches             - Get all matches (with filters)
GET    /api/v1/matches/{matchId}   - Get match details
PUT    /api/v1/matches/{matchId}   - Update match
DELETE /api/v1/matches/{matchId}   - Delete match
POST   /api/v1/matches/{matchId}/start - Start match
POST   /api/v1/matches/{matchId}/end   - End match
GET    /api/v1/matches/{matchId}/scorecard - Get match scorecard
POST   /api/v1/matches/{matchId}/ball   - Record ball
POST   /api/v1/matches/{matchId}/wicket - Record wicket
```

### 5.4 Team APIs
```
POST   /api/v1/teams              - Create team
GET    /api/v1/teams              - Get all teams
GET    /api/v1/teams/{teamId}     - Get team details
PUT    /api/v1/teams/{teamId}     - Update team
DELETE /api/v1/teams/{teamId}     - Delete team
POST   /api/v1/teams/{teamId}/players - Add player to team
DELETE /api/v1/teams/{teamId}/players/{playerId} - Remove player
GET    /api/v1/teams/{teamId}/squad - Get team squad
```

### 5.5 Player APIs
```
POST   /api/v1/players            - Create player
GET    /api/v1/players            - Get all players
GET    /api/v1/players/{playerId} - Get player details
PUT    /api/v1/players/{playerId} - Update player
DELETE /api/v1/players/{playerId} - Delete player
GET    /api/v1/players/{playerId}/statistics - Get player stats
GET    /api/v1/players/search     - Search players
```

### 5.6 Statistics APIs
```
GET    /api/v1/statistics/batting/{playerId}  - Get batting stats
GET    /api/v1/statistics/bowling/{playerId}  - Get bowling stats
GET    /api/v1/statistics/match/{matchId}     - Get match statistics
GET    /api/v1/statistics/tournament/{tournamentId} - Tournament stats
```

### 5.7 Leaderboard APIs
```
GET    /api/v1/leaderboards/{tournamentId}    - Get tournament leaderboard
GET    /api/v1/leaderboards/top-scorers       - Top batsmen
GET    /api/v1/leaderboards/top-bowlers       - Top bowlers
```

### 5.8 Tournament APIs
```
POST   /api/v1/tournaments          - Create tournament
GET    /api/v1/tournaments          - Get all tournaments
GET    /api/v1/tournaments/{id}     - Get tournament details
PUT    /api/v1/tournaments/{id}     - Update tournament
DELETE /api/v1/tournaments/{id}     - Delete tournament
POST   /api/v1/tournaments/{id}/teams - Register team
POST   /api/v1/tournaments/{id}/generate-fixtures - Generate fixtures
```

---

## 6. Spring Boot Configuration

### 6.1 Application Properties

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/
server.compression.enabled=true

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/cricket_db
spring.datasource.username=cricket_user
spring.datasource.password=password123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Connection Pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# Redis Configuration
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=
spring.redis.timeout=60000ms

# JWT Configuration
jwt.secret=your-secret-key-min-32-characters-long
jwt.expiration=86400000 # 24 hours in milliseconds
jwt.refresh.expiration=604800000 # 7 days

# Logging
logging.level.root=INFO
logging.level.com.cricketapp=DEBUG
logging.file.name=logs/cricket-app.log

# Jackson Configuration
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.serialization.indent-output=true

# Flyway Configuration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# WebSocket Configuration
spring.websocket.server.port=8080
```

### 6.2 Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .exceptionHandling()
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                })
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }
}
```

---

## 7. Development Setup

### 7.1 Prerequisites
- **Java 17+**
- **Maven 3.8+** or **Gradle 7.x+**
- **PostgreSQL 14+**
- **Redis 7.x+**
- **Docker & Docker Compose** (optional)

### 7.2 Local Development Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/cricket-app.git
cd cricket-app/backend/cricket-api
```

#### Step 2: Setup Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE cricket_db;
CREATE USER cricket_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE cricket_db TO cricket_user;
```

#### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

#### Step 4: Build and Run with Maven
```bash
# Clean and build
mvn clean package

# Run application
mvn spring-boot:run

# Or run jar directly
java -jar target/cricket-api-1.0.0.jar
```

#### Step 5: Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

### 7.3 Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: cricket_db
      POSTGRES_USER: cricket_user
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cricket_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  cricket-api:
    build: ./cricket-api
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cricket_db
      SPRING_DATASOURCE_USERNAME: cricket_user
      SPRING_DATASOURCE_PASSWORD: password123
      SPRING_REDIS_HOST: redis
    volumes:
      - ./cricket-api/logs:/app/logs

volumes:
  postgres_data:
```

---

## 8. Building & Deployment

### 8.1 Build Process

```bash
# Development Build
mvn clean package -DskipTests

# Production Build
mvn clean package -P prod

# With Tests
mvn clean verify
```

### 8.2 Docker Build

```dockerfile
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:resolve
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 8.3 Deployment Options

#### Cloud Platforms
- **AWS**: Elastic Beanstalk, ECS, EC2
- **Azure**: App Service, AKS, Virtual Machines
- **Google Cloud**: App Engine, Cloud Run, GKE
- **Heroku**: (for small projects)

---

## 9. Testing Strategy

### 9.1 Unit Testing

```java
@SpringBootTest
class AuthServiceTest {
    
    @MockBean
    private UserRepository userRepository;
    
    @InjectMocks
    private AuthService authService;
    
    @Test
    void testUserRegistration() {
        // Test logic
    }
}
```

### 9.2 Integration Testing

```java
@SpringBootTest
@Testcontainers
class MatchControllerIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = 
        new PostgreSQLContainer<>("postgres:14-alpine");
    
    @Test
    void testCreateMatch() {
        // Integration test logic
    }
}
```

### 9.3 API Testing with REST Assured

```java
@Test
void testGetMatchAPI() {
    given()
        .header("Authorization", "Bearer " + token)
    .when()
        .get("/api/v1/matches/1")
    .then()
        .statusCode(200)
        .body("id", equalTo(1));
}
```

---

## 10. Performance Optimization

### 10.1 Caching Strategy
- Redis for session caching
- Spring Cache annotations
- Database query optimization
- N+1 query prevention using JPA fetch strategies

### 10.2 Database Optimization
- Proper indexing on frequently queried columns
- Connection pooling configuration
- Query optimization and monitoring
- Pagination for large result sets

### 10.3 API Optimization
- Response compression
- Pagination and filtering
- Async processing for heavy operations
- Rate limiting

---

## 11. Monitoring & Logging

### 11.1 Logging Configuration

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>
```

### 11.2 Monitoring Setup

```java
@Configuration
public class MonitoringConfig {
    
    @Bean
    public MeterRegistry meterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }
}
```

### 11.3 Health Checks

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        return Health.up().build();
    }
}
```

---

## 12. Development Guidelines

### 12.1 Code Standards
- Follow Spring Boot best practices
- Use meaningful variable and method names
- Implement proper error handling
- Write self-documenting code
- Use Lombok for boilerplate reduction

### 12.2 Package Structure
- Organize by feature (domain)
- Clear separation of concerns
- Dependency inversion principle
- Loose coupling, high cohesion

### 12.3 Naming Conventions
- Classes: PascalCase (UserService, MatchController)
- Methods: camelCase (getUserById, createMatch)
- Variables: camelCase (userId, matchName)
- Constants: UPPER_SNAKE_CASE (MAX_RETRIES, DEFAULT_TIMEOUT)
- Database: snake_case (user_id, created_at)

### 12.4 Git Workflow
```
main (production)
  └── develop (staging)
      └── feature/feature-name (feature branches)
      └── bugfix/bug-name (bugfix branches)
      └── hotfix/issue-name (hotfix branches)
```

---

## 13. Implementation Phases

### Phase 1 (Months 1-2): Core Setup & MVP
- ✅ Project setup with Spring Boot
- ✅ Database design and implementation
- ✅ User authentication (JWT)
- ✅ Basic CRUD APIs for Users, Teams, Players
- ✅ Basic Match creation and viewing
- ✅ Unit tests

### Phase 2 (Months 3-4): Live Features
- ✅ WebSocket implementation for live scoring
- ✅ Real-time ball updates
- ✅ Match scoring APIs
- ✅ Basic statistics calculation
- ✅ Integration testing

### Phase 3 (Months 5-6): Advanced Features
- ✅ Tournament management
- ✅ Leaderboards
- ✅ Redis caching
- ✅ Notification system
- ✅ Advanced statistics and analytics

### Phase 4 (Months 7-8): Polish & Deployment
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Monitoring setup
- ✅ Docker containerization
- ✅ Production deployment
- ✅ Load testing

---

## 14. Key Dependencies Versions

```
Java: 17 LTS
Spring Boot: 3.1.x
Spring Cloud: 2022.0.x
PostgreSQL Driver: 42.6.x
JWT: 0.11.5
Lombok: 1.18.x
MapStruct: 1.5.x
JUnit 5: 5.9.x
Mockito: 5.3.x
TestContainers: 1.18.x
```

---

## 15. Production Checklist

- [ ] SSL/TLS certificates configured
- [ ] Database backups automated
- [ ] Monitoring and alerting setup
- [ ] Logging aggregation configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] CI/CD pipeline established
- [ ] Disaster recovery plan documented
- [ ] Scaling strategy defined

---

## 16. Useful Resources

### Documentation
- [Spring Boot Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

### Tools
- **IDE**: IntelliJ IDEA, Eclipse, VS Code
- **API Testing**: Postman, Insomnia
- **Database**: pgAdmin, DBeaver
- **Container**: Docker Desktop
- **Version Control**: Git + GitHub

---

## Document Version: 1.0
**Last Updated**: 2026-06-13
**Status**: Complete for Development

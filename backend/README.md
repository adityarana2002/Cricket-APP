# CricMax Backend

Spring Boot REST API for CricMax

## Technology Stack (LTS Stable Versions)

- **Runtime**: Java 21 LTS (Latest LTS, Supported until 2031)
- **Framework**: Spring Boot 3.2.4 LTS (Stable Production Release)
- **Build Tool**: Maven 3.8.1+
- **Database**: PostgreSQL 15/16 LTS (Stable, Supported until 2024-2025)
- **Cache**: Redis 7.x LTS
- **Security**: Spring Security 6.2.x + JWT (jjwt 0.12.x)
- **Real-time**: WebSocket (Spring native support)

## Project Structure

```
src/main/java/com/cricketapp/
├── CricketAppApplication.java    # Main application entry point
├── config/                        # Configuration classes
├── controller/                    # REST API endpoints
├── service/                       # Business logic
├── repository/                    # Data access layer
├── entity/                        # JPA entities
├── dto/                           # Data transfer objects
├── security/                      # Security configuration & JWT
├── websocket/                     # WebSocket handlers
├── exception/                     # Exception handlers
└── util/                          # Utility classes

src/main/resources/
├── application.properties         # Default configuration
├── application-dev.properties     # Development configuration
└── application-prod.properties    # Production configuration
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 14+
- Redis 7.x

### Installation

1. Clone the repository
2. Navigate to backend directory: `cd backend`
3. Install dependencies: `mvn clean install`
4. Configure database and Redis in `application.properties`
5. Run the application: `mvn spring-boot:run`

Server will start on `http://localhost:8080`

### Development

```bash
# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Run tests
mvn test

# Build JAR
mvn clean package
```

## API Documentation

Base URL: `http://localhost:8080/api/v1`

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - Logout user

### Match Endpoints

- `GET /matches` - List all matches
- `GET /matches/{id}` - Get match details
- `POST /matches` - Create new match
- `PUT /matches/{id}` - Update match
- `GET /matches/{id}/scorecard` - Get scorecard
- `POST /matches/{id}/ball` - Record ball info

### Team Endpoints

- `GET /teams` - List all teams
- `GET /teams/{id}` - Get team details
- `POST /teams` - Create new team
- `PUT /teams/{id}` - Update team
- `GET /teams/{id}/players` - Get team players

### Player Endpoints

- `GET /players` - List all players
- `GET /players/{id}` - Get player details
- `POST /players` - Create new player
- `PUT /players/{id}` - Update player
- `GET /players/{id}/statistics` - Get player statistics

## WebSocket

Connect to: `ws://localhost:8080/ws`

Events:
- `match.started` - Match started
- `match.wicket` - Wicket event
- `match.boundary` - Boundary event
- `match.ended` - Match ended

## Database Schema

Key tables:
- `users` - User information
- `teams` - Team information
- `players` - Player information
- `matches` - Match information
- `innings` - Innings information
- `ball_info` - Ball-by-ball information
- `statistics` - Player statistics
- `leaderboards` - Leaderboard rankings

## Environment Variables (Production)

```
DB_URL=jdbc:postgresql://host:5432/cricket_db
DB_USERNAME=username
DB_PASSWORD=password
REDIS_HOST=host
REDIS_PORT=6379
REDIS_PASSWORD=password
JWT_SECRET=your-secret-key
```

## Docker

Build: `docker build -t cricmax-backend .`
Run: `docker run -p 8080:8080 cricmax-backend`

## Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request

## License

MIT License

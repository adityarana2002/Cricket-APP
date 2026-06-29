# 🏏 Cricket App - MySQL Setup Guide

## 📋 Prerequisites

Make sure you have:
- ✅ Java 21 LTS installed
- ✅ Maven 3.9+ installed
- ✅ **MySQL 8.0+ installed** (This replaces PostgreSQL)
- ✅ Node.js 20 LTS installed

---

## 🚀 Step 1: Install & Setup MySQL

### Windows Installation

#### Option 1: Using MySQL Installer (Easiest)
1. Download MySQL 8.0 Community Edition from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer (.msi file)
3. Choose "Developer Default" setup
4. Leave defaults: Port 3306, MySQL as a service
5. Set root password (remember this!)
6. Complete installation

#### Option 2: Using Chocolatey
```powershell
choco install mysql
```

#### Option 3: Using Docker
```powershell
docker run -d `
  --name mysql `
  -e MYSQL_ROOT_PASSWORD=root `
  -e MYSQL_DATABASE=cricket_db `
  -p 3306:3306 `
  mysql:8.0
```

### Linux Installation (Ubuntu/Debian)
```bash
# Update packages
sudo apt update

# Install MySQL
sudo apt install mysql-server -y

# Secure MySQL
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
```

### macOS Installation
```bash
# Using Homebrew
brew install mysql

# Start MySQL
brew services start mysql

# Secure installation
mysql_secure_installation
```

---

## ✅ Step 2: Verify MySQL is Running

### Windows
```powershell
# Check if service is running
Get-Service MySQL80
# Should show "Running"

# Or connect using MySQL Command Line Client
mysql -u root -p
# Enter your password when prompted
```

### Linux/macOS
```bash
# Check service status
sudo systemctl status mysql

# Or connect
mysql -u root -p
```

### Test Connection
```bash
mysql -h localhost -u root -p -e "SELECT 1;"
# Should return: 1
```

---

## 🗄️ Step 3: Create Database and User

### Option 1: Using MySQL CLI

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE cricket_db;

# Create user (recommended for security)
CREATE USER 'cricketuser'@'localhost' IDENTIFIED BY 'cricket_password';

# Grant permissions
GRANT ALL PRIVILEGES ON cricket_db.* TO 'cricketuser'@'localhost';
FLUSH PRIVILEGES;

# Verify
SHOW DATABASES;
EXIT;
```

### Option 2: Using MySQL Workbench (GUI)
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Right-click "Databases" → "Create Database"
4. Name: `cricket_db`, Charset: `utf8mb4`
5. Click "Apply"
6. Go to Server → Users and Privileges
7. Add User: `cricketuser`, Password: `cricket_password`
8. Set permissions for `cricket_db` to "All"

---

## 📝 Step 4: Import Database Schema

### Option 1: Using MySQL CLI
```bash
# Navigate to project directory
cd "p:\Cricket App"

# Import schema
mysql -u root -p cricket_db < backend/src/main/resources/db/schema.sql

# Or if using the custom user
mysql -u cricketuser -p cricket_db < backend/src/main/resources/db/schema.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script
4. Navigate to: `backend/src/main/resources/db/schema.sql`
5. Click "Open"
6. Click "Execute" (lightning bolt icon)
7. Switch to `cricket_db` database
8. Right-click Refresh to see tables

### Option 3: Using Command Prompt
```cmd
cd "p:\Cricket App\backend\src\main\resources\db"
mysql -u root -p cricket_db < schema.sql
```

---

## ⚙️ Step 5: Configure Application

The configuration has been updated automatically. Check `backend/src/main/resources/application.properties`:

```properties
# Database Configuration (MySQL Local)
spring.datasource.url=jdbc:mysql://localhost:3306/cricket_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### If you created a custom user, update:
```properties
spring.datasource.username=cricketuser
spring.datasource.password=cricket_password
```

### If you set a root password, update:
```properties
spring.datasource.password=your_root_password
```

---

## ✅ Step 6: Verify Database Setup

### Using MySQL CLI
```bash
# Connect to database
mysql -u root -p cricket_db

# Show tables
SHOW TABLES;

# Should display:
# audit_log
# ball_info
# commentary
# innings
# leaderboards
# matches
# player_statistics
# players
# refresh_tokens
# teams
# tournaments
# users

# Check sample data
SELECT * FROM users;
SELECT * FROM teams;

# Exit
EXIT;
```

### Using MySQL Workbench
1. Connect to server
2. Click on `cricket_db` database
3. Click "Tables" folder to expand
4. See all 11 tables listed
5. Double-click any table to view data

---

## 🚀 Step 7: Run Backend

```bash
# Navigate to backend
cd "p:\Cricket App\backend"

# Build with Maven
mvn clean install

# Run
mvn spring-boot:run

# Should see:
# Started CricketAppApplication in X.XXX seconds
# Backend ready on http://localhost:8080/api
```

---

## 🎨 Step 8: Run Frontend

```bash
# Open new terminal
cd "p:\Cricket App\frontend"

# Install dependencies
npm install

# Start
npm start

# Opens http://localhost:3000
```

---

## 🧪 Step 9: Test Everything

### Test Backend
```bash
# In new terminal
curl http://localhost:8080/api/v1/health

# Should return:
# "Cricket App Backend is Running!"
```

### Test Frontend
1. Open http://localhost:3000
2. Click "Register"
3. Create account with any valid email
4. Click "Login"
5. Enter credentials
6. Should see dashboard with your profile

---

## 📊 Verify Database Has Data

```bash
mysql -u root -p cricket_db

# Check users
SELECT email, role, is_active FROM users;

# Check teams
SELECT name, country FROM teams;

# Check indexes
SHOW INDEX FROM users;

# Exit
EXIT;
```

---

## 🔧 Troubleshooting

### MySQL Connection Refused
```bash
# Check if MySQL is running
# Windows: Services → Look for MySQL80
# Linux: sudo systemctl status mysql
# macOS: brew services list

# Restart MySQL
# Windows: net stop MySQL80 && net start MySQL80
# Linux: sudo systemctl restart mysql
# macOS: brew services restart mysql
```

### Can't Connect with Password
```bash
# Reset root password (Windows)
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';"

# Update application.properties with new password
```

### "Access Denied for user 'root'@'localhost'"
```bash
# Verify MySQL service is running
# Make sure you're using correct password
# Check application.properties has correct credentials
```

### Database Already Exists Error
```bash
# Drop existing database
mysql -u root -p -e "DROP DATABASE cricket_db;"

# Then run schema again
mysql -u root -p < backend/src/main/resources/db/schema.sql
```

### Schema.sql Not Running
```bash
# Verify file exists
cd backend/src/main/resources/db
dir schema.sql

# Run with full path
mysql -u root -p cricket_db < "C:\Path\To\Cricket App\backend\src\main\resources\db\schema.sql"
```

### Build Fails: MySQL Driver Not Found
```bash
# Clear Maven cache
rmdir /s /q %USERPROFILE%\.m2\repository\com\mysql

# Rebuild
mvn clean install
```

---

## 📚 Quick MySQL Commands

```bash
# Connect to MySQL
mysql -u root -p

# List databases
SHOW DATABASES;

# Use database
USE cricket_db;

# Show tables
SHOW TABLES;

# Describe table
DESCRIBE users;

# View sample data
SELECT * FROM users LIMIT 5;

# View table creation syntax
SHOW CREATE TABLE users;

# Check table size
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb 
FROM information_schema.tables 
WHERE table_schema = 'cricket_db';

# Exit
EXIT;
```

---

## 🎯 Expected MySQL Setup

After successful setup, you should have:

✅ MySQL running on localhost:3306  
✅ Database `cricket_db` created  
✅ 11 tables with data  
✅ Foreign key relationships intact  
✅ Indexes on key columns  
✅ Sample data (users, teams) inserted  

---

## 📝 Configuration Summary

| Setting | Value | File |
|---------|-------|------|
| **Host** | localhost | application.properties |
| **Port** | 3306 | application.properties |
| **Database** | cricket_db | schema.sql |
| **Username** | root | application.properties |
| **Password** | (your root password) | application.properties |
| **Driver** | MySQL 8.0+ | pom.xml |
| **Dialect** | MySQL8Dialect | application.properties |

---

## ✨ What's Different from PostgreSQL?

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| **Serial ID** | BIGSERIAL | BIGINT AUTO_INCREMENT |
| **Timezone** | Implicit | Explicit (serverTimezone) |
| **Large Text** | TEXT | LONGTEXT |
| **JSON** | JSONB | JSON |
| **Auto Update** | Manual | ON UPDATE CURRENT_TIMESTAMP |
| **Insert Ignore** | ON CONFLICT | INSERT IGNORE |
| **Boolean** | BOOLEAN | TINYINT(1) / BOOLEAN |
| **Indexes** | CREATE INDEX | KEY (inline) |

---

## 🎉 You're Ready!

Once all steps are complete, you have:
- ✅ MySQL 8.0+ running locally
- ✅ cricket_db database created
- ✅ Schema with 11 tables
- ✅ Sample data loaded
- ✅ Application configured
- ✅ Ready to build & run

**Next Steps:**
1. Run `mvn clean install` in backend
2. Run `mvn spring-boot:run` to start backend
3. Run `npm install && npm start` in frontend
4. Test at http://localhost:3000

---

**Happy coding with MySQL! 🎊**

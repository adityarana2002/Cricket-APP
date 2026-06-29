-- Cricket App Database Schema
-- MySQL 8.0+ LTS
-- Created: 2024-06-13

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(500),
    bio LONGTEXT,
    country VARCHAR(100),
    role VARCHAR(50) DEFAULT 'PLAYER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_users_email (email),
    KEY idx_users_role (role)
);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description LONGTEXT,
    logo_url VARCHAR(500),
    founded_year INT,
    country VARCHAR(100),
    city VARCHAR(100),
    coach_id BIGINT,
    captain_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (captain_id) REFERENCES users(id),
    KEY idx_teams_name (name),
    KEY idx_teams_country (country)
);

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    team_id BIGINT,
    jersey_number INT,
    batting_style VARCHAR(50),
    bowling_style VARCHAR(50),
    playing_role VARCHAR(50),
    height INT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    KEY idx_players_user_id (user_id),
    KEY idx_players_team_id (team_id),
    KEY idx_players_role (playing_role)
);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description LONGTEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    format VARCHAR(50),
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'UPCOMING',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    KEY idx_tournaments_status (status),
    KEY idx_tournaments_format (format)
);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT,
    team1_id BIGINT NOT NULL,
    team2_id BIGINT NOT NULL,
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(200),
    match_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'UPCOMING',
    toss_winner_id BIGINT,
    toss_decision VARCHAR(50),
    winner_id BIGINT,
    man_of_match_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (toss_winner_id) REFERENCES teams(id),
    FOREIGN KEY (winner_id) REFERENCES teams(id),
    FOREIGN KEY (man_of_match_id) REFERENCES players(id),
    KEY idx_matches_status (status),
    KEY idx_matches_tournament_id (tournament_id),
    KEY idx_matches_team1_id (team1_id),
    KEY idx_matches_team2_id (team2_id),
    KEY idx_matches_match_date (match_date)
);

-- ============================================
-- INNINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS innings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    batting_team_id BIGINT NOT NULL,
    bowling_team_id BIGINT NOT NULL,
    innings_number INT,
    runs INT DEFAULT 0,
    wickets INT DEFAULT 0,
    overs DECIMAL(4,1) DEFAULT 0.0,
    extras INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (batting_team_id) REFERENCES teams(id),
    FOREIGN KEY (bowling_team_id) REFERENCES teams(id),
    KEY idx_innings_match_id (match_id),
    KEY idx_innings_batting_team_id (batting_team_id)
);

-- ============================================
-- BALL_INFO TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ball_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    innings_id BIGINT NOT NULL,
    over INT,
    ball INT,
    batsman_id BIGINT NOT NULL,
    bowler_id BIGINT NOT NULL,
    runs INT DEFAULT 0,
    wicket BOOLEAN DEFAULT false,
    wicket_type VARCHAR(50),
    fielder_id BIGINT,
    dot_ball BOOLEAN DEFAULT false,
    is_wide BOOLEAN DEFAULT false,
    is_no_ball BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    FOREIGN KEY (batsman_id) REFERENCES players(id),
    FOREIGN KEY (bowler_id) REFERENCES players(id),
    FOREIGN KEY (fielder_id) REFERENCES players(id),
    KEY idx_ball_info_innings_id (innings_id),
    KEY idx_ball_info_batsman_id (batsman_id),
    KEY idx_ball_info_bowler_id (bowler_id)
);

-- ============================================
-- PLAYER_STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_statistics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL UNIQUE,
    matches_played INT DEFAULT 0,
    runs_scored INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    average_score DECIMAL(8,2) DEFAULT 0,
    strike_rate DECIMAL(8,2) DEFAULT 0,
    wickets_taken INT DEFAULT 0,
    balls_bowled INT DEFAULT 0,
    runs_conceded INT DEFAULT 0,
    economy_rate DECIMAL(8,2) DEFAULT 0,
    catches INT DEFAULT 0,
    stumpings INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    KEY idx_player_statistics_player_id (player_id)
);

-- ============================================
-- LEADERBOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    player_id BIGINT,
    team_id BIGINT,
    category VARCHAR(50),
    rank INT,
    value INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    KEY idx_leaderboards_tournament_id (tournament_id),
    KEY idx_leaderboards_category (category),
    KEY idx_leaderboards_player_id (player_id)
);

-- ============================================
-- COMMENTARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commentary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    innings_id BIGINT NOT NULL,
    over INT,
    ball INT,
    description LONGTEXT NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    KEY idx_commentary_match_id (match_id),
    KEY idx_commentary_innings_id (innings_id)
);

-- ============================================
-- REFRESH_TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_refresh_tokens_user_id (user_id),
    KEY idx_refresh_tokens_token (token)
);

-- ============================================
-- AUDIT_LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    KEY idx_audit_log_user_id (user_id),
    KEY idx_audit_log_entity_type (entity_type),
    KEY idx_audit_log_created_at (created_at)
);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample user (Admin)
INSERT IGNORE INTO users (email, password, first_name, last_name, role, is_active)
VALUES ('admin@cricketapp.com', 'hashed_password_here', 'Admin', 'User', 'ADMIN', true);

-- Insert sample teams
INSERT IGNORE INTO teams (name, country, city, founded_year, is_active)
VALUES 
    ('India', 'India', 'Delhi', 2000, true),
    ('Australia', 'Australia', 'Sydney', 2000, true),
    ('England', 'England', 'London', 2000, true),
    ('Pakistan', 'Pakistan', 'Karachi', 2000, true);

-- ============================================
-- END OF SCHEMA
-- ============================================

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    team_id BIGINT,
    jersey_number INT,
    batting_style VARCHAR(50), -- Left-handed, Right-handed
    bowling_style VARCHAR(50), -- Right-arm, Left-arm, etc
    playing_role VARCHAR(50), -- Batsman, Bowler, All-rounder, Wicket-keeper
    height INT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_role ON players(playing_role);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    format VARCHAR(50), -- T20, ODI, Test, etc
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'UPCOMING', -- UPCOMING, ONGOING, COMPLETED
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_format ON tournaments(format);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT,
    team1_id BIGINT NOT NULL,
    team2_id BIGINT NOT NULL,
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(200),
    match_type VARCHAR(50), -- T20, ODI, Test
    status VARCHAR(50) DEFAULT 'UPCOMING', -- UPCOMING, ONGOING, COMPLETED
    toss_winner_id BIGINT,
    toss_decision VARCHAR(50), -- BAT, BOWL
    winner_id BIGINT,
    man_of_match_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (toss_winner_id) REFERENCES teams(id),
    FOREIGN KEY (winner_id) REFERENCES teams(id),
    FOREIGN KEY (man_of_match_id) REFERENCES players(id)
);

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_team1_id ON matches(team1_id);
CREATE INDEX idx_matches_team2_id ON matches(team2_id);
CREATE INDEX idx_matches_match_date ON matches(match_date);

-- ============================================
-- INNINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS innings (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    batting_team_id BIGINT NOT NULL,
    bowling_team_id BIGINT NOT NULL,
    innings_number INT,
    runs INT DEFAULT 0,
    wickets INT DEFAULT 0,
    overs DECIMAL(4,1) DEFAULT 0.0,
    extras INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (batting_team_id) REFERENCES teams(id),
    FOREIGN KEY (bowling_team_id) REFERENCES teams(id)
);

CREATE INDEX idx_innings_match_id ON innings(match_id);
CREATE INDEX idx_innings_batting_team_id ON innings(batting_team_id);

-- ============================================
-- BALL_INFO TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ball_info (
    id BIGSERIAL PRIMARY KEY,
    innings_id BIGINT NOT NULL,
    over INT,
    ball INT,
    batsman_id BIGINT NOT NULL,
    bowler_id BIGINT NOT NULL,
    runs INT DEFAULT 0,
    wicket BOOLEAN DEFAULT false,
    wicket_type VARCHAR(50), -- Bowled, Caught, LBW, etc
    fielder_id BIGINT,
    dot_ball BOOLEAN DEFAULT false,
    is_wide BOOLEAN DEFAULT false,
    is_no_ball BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    FOREIGN KEY (batsman_id) REFERENCES players(id),
    FOREIGN KEY (bowler_id) REFERENCES players(id),
    FOREIGN KEY (fielder_id) REFERENCES players(id)
);

CREATE INDEX idx_ball_info_innings_id ON ball_info(innings_id);
CREATE INDEX idx_ball_info_batsman_id ON ball_info(batsman_id);
CREATE INDEX idx_ball_info_bowler_id ON ball_info(bowler_id);

-- ============================================
-- PLAYER_STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_statistics (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL UNIQUE,
    matches_played INT DEFAULT 0,
    runs_scored INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    average_score DECIMAL(8,2) DEFAULT 0,
    strike_rate DECIMAL(8,2) DEFAULT 0,
    wickets_taken INT DEFAULT 0,
    balls_bowled INT DEFAULT 0,
    runs_conceded INT DEFAULT 0,
    economy_rate DECIMAL(8,2) DEFAULT 0,
    catches INT DEFAULT 0,
    stumpings INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX idx_player_statistics_player_id ON player_statistics(player_id);

-- ============================================
-- LEADERBOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    player_id BIGINT,
    team_id BIGINT,
    category VARCHAR(50), -- TOP_BATSMAN, TOP_BOWLER, TEAM_RANKING, etc
    rank INT,
    value INT DEFAULT 0, -- Runs, Wickets, Points, etc
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE INDEX idx_leaderboards_tournament_id ON leaderboards(tournament_id);
CREATE INDEX idx_leaderboards_category ON leaderboards(category);
CREATE INDEX idx_leaderboards_player_id ON leaderboards(player_id);

-- ============================================
-- COMMENTARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commentary (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    innings_id BIGINT NOT NULL,
    over INT,
    ball INT,
    description TEXT NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_commentary_match_id ON commentary(match_id);
CREATE INDEX idx_commentary_innings_id ON commentary(innings_id);

-- ============================================
-- REFRESH_TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- AUDIT_LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert sample user (Admin)
INSERT INTO users (email, password, first_name, last_name, role, is_active)
VALUES ('admin@cricketapp.com', 'hashed_password_here', 'Admin', 'User', 'ADMIN', true)
ON CONFLICT DO NOTHING;

-- Insert sample teams
INSERT INTO teams (name, country, city, founded_year, is_active)
VALUES 
    ('India', 'India', 'Delhi', 2000, true),
    ('Australia', 'Australia', 'Sydney', 2000, true),
    ('England', 'England', 'London', 2000, true),
    ('Pakistan', 'Pakistan', 'Karachi', 2000, true)
ON CONFLICT DO NOTHING;

COMMIT;

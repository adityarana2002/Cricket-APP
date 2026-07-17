# 🔄 MySQL → PostgreSQL Migration Plan (CricMax)

> **Purpose:** This document lists **exactly which files change and what changes in each**, so you can review before any code is touched. Nothing here is applied yet — it's a map.

---

## ✅ Summary: Only **4 real code files** need changes

| # | File | What changes | Effort |
|---|------|--------------|--------|
| 1 | `backend/pom.xml` | Swap MySQL JDBC driver → PostgreSQL driver | 🟢 Easy |
| 2 | `backend/src/main/resources/application.properties` | Change JDBC URL, driver class, dialect | 🟢 Easy |
| 3 | `backend/src/main/resources/application-prod.properties` | Update one comment (config comes from env vars) | 🟢 Trivial |
| 4 | `backend/src/main/resources/db/schema.sql` | Rewrite in PostgreSQL syntax + delete broken duplicate tail | 🟠 Main work |

> **Java code (entities, controllers, services): NO CHANGES.** JPA/Hibernate abstracts the database. `ddl-auto=update` means Hibernate can even auto-create the tables, so `schema.sql` is only used if you run it manually.

Everything else (`.md` guides) is **documentation only** — optional to update, does not affect the running app.

---

## 1️⃣ `backend/pom.xml`  (lines ~71–77)

**Change the driver dependency.**

```xml
<!-- BEFORE (MySQL) -->
<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.2.0</version>
    <scope>runtime</scope>
</dependency>
```

```xml
<!-- AFTER (PostgreSQL) -->
<!-- PostgreSQL Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```
> Version can be omitted — Spring Boot's parent BOM manages the PostgreSQL driver version for you.

---

## 2️⃣ `backend/src/main/resources/application.properties`  (lines 7, 10, 16)

Three lines change:

| Line | Before (MySQL) | After (PostgreSQL) |
|------|----------------|--------------------|
| **7** | `spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/cricket_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}` | `spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/cricket_db}` |
| **10** | `spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver` | `spring.datasource.driver-class-name=org.postgresql.Driver` |
| **16** | `spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect` | `spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect` |

> 🔸 Note the **port change: `3306` → `5432`** (Postgres default).
> 🔸 The MySQL-only URL params (`useSSL`, `serverTimezone`, `allowPublicKeyRetrieval`) are dropped — Postgres doesn't use them.
> 🔸 Username/password lines (8, 9) stay the same, but locally your Postgres user is usually `postgres` — update `DB_USERNAME:root` → `DB_USERNAME:postgres` if needed.

---

## 3️⃣ `backend/src/main/resources/application-prod.properties`  (line 4)

This file reads everything from **environment variables** (`${DB_URL}`, `${DB_USERNAME}`, etc.), so **no functional change** — just fix the stale comment:

| Line | Before | After |
|------|--------|-------|
| **4** | `# Database — Aiven MySQL (SSL required)` | `# Database — PostgreSQL (SSL required)` |

> The real prod change happens **outside the code** — in your host dashboard (Render/Aiven), set `DB_URL` to a `jdbc:postgresql://...` connection string and provision a Postgres instance instead of MySQL.

---

## 4️⃣ `backend/src/main/resources/db/schema.sql`  (the big one)

This file needs a full rewrite to PostgreSQL syntax. Key translations:

| MySQL | PostgreSQL |
|-------|-----------|
| `BIGINT AUTO_INCREMENT PRIMARY KEY` | `BIGSERIAL PRIMARY KEY` |
| `LONGTEXT` | `TEXT` |
| `updated_at ... ON UPDATE CURRENT_TIMESTAMP` | ❌ not supported → use a trigger, or let JPA `@PreUpdate` handle it |
| `KEY idx_name (col)` **inside** `CREATE TABLE` | ❌ move out → `CREATE INDEX idx_name ON table(col);` |
| `details JSON` | `details JSONB` |
| `INSERT IGNORE INTO ...` | `INSERT INTO ... ON CONFLICT DO NOTHING;` |
| `rank INT` | ⚠️ `rank` is a reserved word in Postgres → quote it: `"rank" INT` |

### ⚠️ Also: this file is currently broken
- **Lines 1–283** = MySQL tables (the real, current schema).
- **Lines 285–530** = leftover **PostgreSQL** copies of `players`, `tournaments`, `matches`, `innings`, `ball_info`, `player_statistics`, `leaderboards`, `commentary`, `refresh_tokens`, `audit_log` — a botched earlier migration. These **duplicate** tables and must be **deleted**, not kept.

> ✅ Good news: since `spring.jpa.hibernate.ddl-auto=update` is set, Hibernate auto-generates the tables from your Java entities on startup. So for **local dev you may not need `schema.sql` at all** — the biggest risk is the broken duplicates confusing anyone who runs the file manually.

---

## 🧭 Recommended order of work

1. **`pom.xml`** — swap the driver.
2. **`application.properties`** — 3 lines (URL, driver, dialect).
3. **`application-prod.properties`** — comment + set env vars in host dashboard.
4. **`schema.sql`** — rewrite for Postgres **or** delete/ignore it and rely on `ddl-auto=update`.
5. Install PostgreSQL locally (port 5432), create DB `cricket_db`, run the app.

---

## 📄 Documentation files (optional — no effect on the app)

These `.md` files still *say* "MySQL" but are just guides. Update later if you want docs to match:
`MYSQL_SETUP_GUIDE.md`, `POSTGRESQL_TO_MYSQL_MIGRATION.md`, `SETUP_QUICK_START.md`,
`Planning.md`, `FINAL_INTEGRATION_CHECKLIST.md`, `DELIVERY_SUMMARY.md`, `LTS_VERSIONS_VERIFIED.md`.

---

**Bottom line:** 4 code files, of which only `schema.sql` is real work. No Java changes. No frontend changes.
</content>
</invoke>

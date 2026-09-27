# CampusHire — Smart College Placement Management System

<div align="center">

![CampusHire Banner](https://img.shields.io/badge/CampusHire-Placement%20Management-0ea5e9?style=for-the-badge&logo=graduationcap)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

**A production-quality end-to-end College Placement Management System**  
built as a full-stack assessment for a college hiring evaluation.

[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [API Docs](./API.md) · [Demo](#demo-scenario)

</div>

---

## Overview

CampusHire manages the **complete college placement lifecycle**:

```
Student Registers → Applies to Jobs → Eligibility Engine Filters → 
Admin Shortlists → Interviews Scheduled → Selected → Placement Confirmed
```

**This is a real application.** Every feature connects to a live Express.js backend and MySQL 8 database. No mocks, no fake data, no static UIs.

---

## Features

### 🎓 For Students
| Feature | Description |
|---------|-------------|
| **Profile Management** | Update CGPA, branch, skills, backlogs |
| **Job Opportunities** | Browse all open positions |
| **Eligibility Check** | Real-time check showing pass/fail for each criteria |
| **One-click Apply** | Apply directly if eligible |
| **Application Tracker** | Visual timeline showing progress |
| **Interview Viewer** | See scheduled rounds with meeting links |
| **Placement Status** | Celebrate placement with package details |

### 🏢 For Admins (Placement Officers)
| Feature | Description |
|---------|-------------|
| **Dashboard** | Live stats: placements, applications, upcoming interviews |
| **Student Directory** | Search/filter all registered students |
| **Company Registry** | Add and manage recruiting companies |
| **Job Posting** | Post jobs with eligibility criteria builder |
| **Application Management** | Move applications through APPLIED→SHORTLISTED→INTERVIEW→SELECTED/REJECTED |
| **Interview Scheduling** | Schedule rounds, assign interviewers, record results |
| **Placement Records** | Confirm placements with package and joining date |

### 🔍 The Eligibility Engine
The heart of the system — a **deterministic rule-based engine** that evaluates 5 criteria:
1. **CGPA** — Minimum threshold check (e.g., ≥ 7.0)
2. **Backlogs** — Maximum allowed backlogs (e.g., 0 active)
3. **Branch** — Eligible branch list (e.g., CSE, AI & ML)
4. **Graduation Year** — Must match job requirement
5. **Skills** — Each required skill checked individually

Returns: `{ eligible: true/false, score: 80, checks: [...] }` — every decision is explainable.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js 20, Express.js, Sequelize ORM |
| **Database** | MySQL 8.0 |
| **Auth** | JWT (jsonwebtoken) + bcrypt |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx (reverse proxy + SPA routing) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                         │
│                                                           │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  MySQL   │◄───│   Backend    │◄───│    Frontend    │  │
│  │  :3306   │    │  Express.js  │    │  React + Vite  │  │
│  │          │    │   :5000      │    │   Nginx :80    │  │
│  └──────────┘    └──────────────┘    └────────────────┘  │
│                         │                    │            │
│                  REST API /api         Proxy /api         │
└─────────────────────────────────────────────────────────┘

Backend Structure:
src/
├── config/        → Database connection
├── models/        → Sequelize models (all associations)
├── services/      → Business logic (eligibility engine)
├── controllers/   → HTTP request handlers
├── routes/        → Express routers
├── middleware/    → Auth + error handling
└── seed/          → Demo data population
```

---

## Quick Start

### Prerequisites
- Docker Desktop 4.x+
- Git

### 1. Clone and Configure
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/campushire.git
cd campushire

# Set up environment variables
cp .env.example .env
# Edit .env with your preferred passwords (or use defaults for local dev)
```

### 2. Launch with Docker Compose
```bash
docker-compose up --build
```

This will:
1. Start **MySQL 8.0** on port 3306
2. Build and start the **Express.js API** on port 5000
3. Build the **React frontend** and serve via **Nginx** on port 80

> ⏳ First build takes ~2-3 minutes. Subsequent starts take ~10 seconds.

### 3. Seed the Database
```bash
docker-compose exec backend node src/seed/seed.js
```

This populates **50+ students, 10+ companies, 15+ jobs** with realistic placement history.

### 4. Open the App
Navigate to **http://localhost** in your browser.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** (Placement Officer) | admin@campushire.demo | Admin@123 |
| **Student** | student@campushire.demo | Student@123 |
| **Recruiter** | recruiter@campushire.demo | Recruiter@123 |

Or click the demo credential cards on the login page.

---

## Demo Scenario (Steps 1–19)

This is the complete business workflow you can demonstrate:

| Step | Action | Who | Where |
|------|--------|-----|-------|
| 1 | Login as Admin | Admin | `/login` |
| 2 | View Dashboard stats | Admin | `/admin/dashboard` |
| 3 | Add a new Company | Admin | `/admin/companies` → + Add |
| 4 | Post a new Job with eligibility criteria | Admin | `/admin/jobs` → Post Job |
| 5 | Logout, login as Student | Student | `/login` |
| 6 | View Profile — update skills/CGPA | Student | `/student/profile` |
| 7 | Browse Opportunities | Student | `/student/opportunities` |
| 8 | Click "Check Eligibility" | Student | `/student/opportunities` |
| 9 | See detailed pass/fail per criteria | Student | Inline on card |
| 10 | Click "Apply Now" (if eligible) | Student | `/student/opportunities` |
| 11 | View application in "My Applications" | Student | `/student/applications` |
| 12 | Logout, login as Admin | Admin | `/login` |
| 13 | Go to Applications → Move to SHORTLISTED | Admin | `/admin/applications` |
| 14 | Schedule an Interview | Admin | `/admin/interviews` → Schedule |
| 15 | Logout, login as Student | Student | `/login` |
| 16 | See Interview in "Interviews" tab | Student | `/student/interviews` |
| 17 | Login as Admin, mark Interview result: PASS | Admin | `/admin/interviews` → PASS |
| 18 | Move Application to SELECTED | Admin | `/admin/applications` |
| 19 | Create Placement Record | Admin | `/admin/placements` → Add |
| 20 | Login as Student — see Placement confirmation | Student | `/student/placement` |

---

## Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
cp .env .env.local

# Update .env to use localhost for DB_HOST
npm run dev   # nodemon with auto-reload
```

### Frontend  
```bash
cd frontend
npm install
npm run dev   # Vite dev server with HMR at localhost:5173
```

### Database
```bash
# Start only MySQL:
docker-compose up mysql -d

# Then in backend dir:
npm run seed  # Populate demo data
```

---

## Running Tests

### Backend Unit Tests (Jest)
```bash
cd backend
npm test
```

Tests cover the **Eligibility Engine** — the core business logic:
- CGPA checks (pass/fail/edge cases)
- Backlog checks
- Branch matching (case-insensitive)
- Skills matching
- Graduation year matching
- Full eligibility evaluation
- Score calculation

### Frontend Type Check
```bash
cd frontend
npx tsc --noEmit
```

---

## API Reference

See **[API.md](./API.md)** for full API documentation.

### Key Endpoints
```
POST /api/auth/login                         → Login
GET  /api/dashboard/stats                    → Dashboard metrics
GET  /api/students/me                        → Current student profile
GET  /api/jobs                               → All jobs
GET  /api/students/:id/jobs/:id/eligibility  → Check eligibility
POST /api/jobs/:id/apply                     → Apply to job
PATCH /api/applications/:id/status          → Update status
POST /api/interviews                         → Schedule interview
PATCH /api/interviews/:id/result            → Record result
POST /api/placements                         → Create placement
```

---

## Project Structure

```
campushire/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── models/              (User, Student, Company, Job, Application, Interview, Placement)
│   │   ├── services/eligibility.service.js   ← Core business logic
│   │   ├── controllers/         (all 8 modules)
│   │   ├── routes/              (all 8 route files)
│   │   ├── middleware/          (auth, errorHandler)
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   └── eligibility.test.js  ← 23 unit tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── hooks/useAuth.tsx     ← Auth context
│   │   ├── layouts/AppLayout.tsx ← Sidebar layout
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── admin/            (Dashboard, Students, Companies, Jobs, Applications, Interviews, Placements)
│   │   │   ├── student/          (Dashboard, Profile, Opportunities, Applications, Interviews, Placement)
│   │   │   └── recruiter/        (Dashboard, Jobs, Applications, Interviews)
│   │   ├── services/api.ts       ← Axios with JWT interceptor
│   │   ├── types/index.ts        ← All TypeScript types
│   │   └── utils/helpers.ts      ← Formatting utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

### Root `.env` (for Docker Compose)
```env
DB_ROOT_PASSWORD=your_root_password
DB_NAME=campushire_db
DB_USER=campushire_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_64_char_random_secret
```

### Backend `.env`
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campushire_db
DB_USER=campushire_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_64_char_random_secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
NODE_ENV=development
```

---

## AWS EC2 Deployment

See **[INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md)** for complete AWS deployment steps.

**Summary:**
```bash
# On EC2 (Ubuntu 22.04)
curl -fsSL https://get.docker.com | sh
sudo apt install docker-compose-plugin -y
git clone https://github.com/YOUR_USERNAME/campushire.git
cd campushire
cp .env.example .env && nano .env  # Fill in secrets
docker compose up -d --build
docker compose exec backend node src/seed/seed.js
# Open http://YOUR_EC2_IP
```

---

## Security Features

- **JWT Authentication** — stateless, stored in localStorage
- **bcrypt** password hashing (12 rounds)
- **Role-based access control** — ADMIN / STUDENT / RECRUITER
- **Helmet.js** — security HTTP headers
- **Express CORS** — configured for known origins
- **Nginx security headers** — X-Frame-Options, CSP

---

## License

MIT — built for educational/assessment purposes.

---

<div align="center">
Built with ❤️ for the CampusHire Assessment | Stack: React · Express · MySQL · Docker
</div>

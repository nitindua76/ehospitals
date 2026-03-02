# 🏥 MedCollaborate — Hospital Collaboration Selection Platform

A full-stack platform for evaluating and selecting the best hospitals for collaboration, featuring a hospital data entry portal and an analytics-rich admin dashboard.

---

## 🚀 Quick Start (Docker — Recommended)

> **Requires**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
cd hospital-selection
docker compose up --build
```

| Service | URL |
|---|---|
| 🏥 Hospital Portal | http://localhost:3000 |
| 📊 Admin Dashboard | http://localhost:3001 |
| 🔧 Backend API | http://localhost:5000/api/health |

**Admin Login**: `admin` / `Admin@123`

> The backend auto-seeds **30 hospitals** on first startup.

---

## 🛠️ Local Development (requires Node.js 18+)

### 1. Start MongoDB
```bash
# Using Docker just for MongoDB
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 2. Backend
```bash
cd backend
npm install
npm run seed      # Load 30 hospitals + admin account
npm run dev       # Starts on port 5000
```

### 3. Hospital Portal
```bash
cd hospital-portal
npm install
npm run dev       # Starts on port 3000
```

### 4. Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev       # Starts on port 3001
```

---

## 🏗️ Architecture

```
hospital-selection/
├── backend/              ← Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── models/       ← Hospital, Admin, ScoringConfig schemas
│   │   ├── routes/       ← hospitals, scoring, auth, export
│   │   ├── middleware/   ← JWT auth
│   │   ├── seed.js       ← 30 sample hospitals + admin setup
│   │   └── index.js      ← Express server
│   └── Dockerfile
├── hospital-portal/      ← React (Vite) — 9-step hospital form
│   └── Dockerfile
├── admin-dashboard/      ← React (Vite) — Analytics & ranking UI
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## ✨ Features

### Hospital Portal (Port 3000)
| Step | Section |
|------|---------|
| 1 | Basic Info (name, type, location, contact) |
| 2 | Capacity (beds, ICU, OT rooms, specialties) |
| 3 | Performance Metrics (outcomes, mortality, readmissions) |
| 4 | Staff Details (doctors, nurses, specialists, experience) |
| 5 | Financial Health (revenue, cost, insurance, debt) |
| 6 | Accreditation (NABH, JCI, NABL, ISO, facilities) |
| 7 | Technology (EMR, telemedicine, AI tools, robotic surgery) |
| 8 | Quality Indicators (satisfaction, infection control, wait times) |
| 9 | Review & Submit |

### Admin Dashboard (Port 3001)
- **🔐 Login** — Secure JWT authentication
- **📊 Dashboard** — KPI cards, top 5 bar chart, type distribution pie, factor overview
- **🏆 Ranking Table** — Live-ranked, color-coded (Top 20 = green, 21–30 = yellow), with per-factor scores
- **📈 Analytics** — Radar chart, scatter plot, state distribution, accreditation/tech adoption bars
- **⚖️ Compare** — Side-by-side radar comparison for up to 5 hospitals
- **⚙️ Scoring Config** — Weighted sliders for 7 factors with live re-ranking, preset profiles
- **📥 CSV Export** — Export all or only selected hospitals
- **👁️ Hospital Drawer** — Full detail view with all metrics and factor breakdown

### Scoring Factors
| Factor | Default Weight |
|--------|---------------|
| Patient Outcomes | 25% |
| Patient Satisfaction | 15% |
| Infrastructure | 15% |
| Staff Quality | 15% |
| Accreditation | 10% |
| Technology | 10% |
| Financial Health | 10% |

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/hospitals` | No | Submit hospital data |
| GET | `/api/hospitals` | Admin | List all hospitals |
| GET | `/api/scoring/rank` | Admin | Get ranked hospitals |
| POST | `/api/scoring/rank` | Admin | Rank with custom weights |
| GET/PUT | `/api/scoring/config` | Admin | Get/save weight config |
| GET | `/api/scoring/stats` | Admin | Dashboard statistics |
| PATCH | `/api/hospitals/:id/select` | Admin | Toggle selection |
| GET | `/api/export/csv` | Admin | Download all as CSV |
| POST | `/api/auth/login` | No | Admin login |

---

## 🌍 Environment Variables

Copy `.env.example` to `.env` and adjust:

```env
MONGO_URI=mongodb://mongodb:27017/hospital_selection
JWT_SECRET=your_super_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123
PORT=5000
```

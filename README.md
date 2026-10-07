# EduTrack – College Project Management & Review Portal

EduTrack is a smart college portal for students, guides, and admins to manage academic projects with ML-based delay prediction, duplicate topic detection, and risk analysis.

## Tech Stack

- **Frontend:** React (.jsx) + Tailwind CSS + Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **ML:** Python (scikit-learn, TF-IDF, NLP) – runs as script invoked by Node

## Project Structure

```
EduTEch/
├── backend/          # Node + Express API
├── frontend/         # React + Vite + Tailwind
├── ml-service/       # Python ML scripts
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.8+ (for ML features)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (MongoDB URI, JWT_SECRET)
npm install
npm run dev
```

Runs on **http://localhost:5000**

### 2. ML Service (Python)

```bash
cd ml-service
pip install -r requirements.txt
```

No separate server needed. The Node backend spawns the Python script when ML endpoints are called. Ensure `python` is on PATH (Windows: often `py`; if so, change `spawn('python', ...)` to `spawn('py', ...)` in `backend/controllers/mlController.js`).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**. Proxy forwards `/api` and `/uploads` to the backend.

### 4. Seed Data (optional)

```bash
cd backend
npm run seed
```

Creates:

- **Admin:** admin@edutrack.com / admin123  
- **Guides:** guide1@edutrack.com, guide2@edutrack.com / guide123  
- **Students:** leelasaisabbarapu22@gmail.com, student2@edutrack.com / student123  
- Sample projects and one review  

## Features

### Students
- Register/Login, create project (title, abstract, domain, tech stack, dates, team, department, batch)
- Upload proposal PDF; optional duplicate topic check (ML) before submit
- Tag a guide for approval; wait for accept/reject
- Submit progress updates and milestone submissions
- View guide feedback; check delay risk (ML); upload final report PDF

### Guides
- View pending project requests; Accept or Reject
- Review accepted projects; add comments and suggestions
- Approve / request corrections / reject milestones
- Track student progress

### Admin
- Dashboard: total, accepted, pending, rejected counts
- Pie chart: project status; pie chart: delay risk distribution
- Bar charts: department-wise and guide-wise project count
- Line chart: submission trend
- ML risk alerts table

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user (JWT) |
| GET | /api/users/guides | List guides (auth) |
| GET | /api/projects | List projects (role-filtered) |
| GET | /api/projects/tagged | Pending requests (guide) |
| GET | /api/projects/admin-stats | Stats & charts (admin) |
| POST | /api/projects | Create project (student, multipart) |
| GET | /api/projects/:id | Project detail + reviews |
| PATCH | /api/projects/:id/tag-guide | Tag guide (student) |
| PATCH | /api/projects/:id/guide-response | Accept/Reject (guide) |
| PATCH | /api/projects/:id/progress | Progress update (student) |
| PATCH | /api/projects/:id/milestones/:mid | Submit/Approve milestone |
| POST | /api/projects/:id/final-report | Upload final PDF (student) |
| POST | /api/reviews | Add review (guide) |
| GET | /api/reviews/project/:id | Reviews for project |
| GET | /api/ml/delay-risk/:id | Delay risk prediction |
| POST | /api/ml/duplicate-check | Duplicate topic check |
| GET | /api/ml/performance-risk/:id | Performance risk |
| GET | /api/ml/report/:id | ML report for project |

## ML Module (Python)

- **Delay prediction:** progress %, milestones, days left, reviews → low/medium/high risk.
- **Duplicate detection:** TF-IDF + cosine similarity on title/abstract vs existing projects.
- **Performance risk:** missed milestones, failed reviews, low activity → risk level.

Node calls `ml-service/app.py` with JSON on stdin and reads JSON from stdout.

## Author

**Leela Sai Sabbarapu**
- Email: leelasaisabbarapu22@gmail.com
- GitHub: [saisabbarapu](https://github.com/saisabbarapu)
- Phone: 8897074233

## License

MIT.

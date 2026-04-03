# E-शिक्षा — Claude Code Rulebook

## What This Project Is
Dual-purpose smart education web app. Two core problems solved:
1. **Teacher attendance** — QR code + facial recognition, no manual roll call
2. **Student productivity** — AI-driven task suggestions during free periods

Live frontend: https://eshiksha-murex.vercel.app/

---

## Monorepo Structure
```
ShikshaShelf/
├── frontend/          # React + Vite + Tailwind (existing SIH frontend)
│   ├── src/
│   │   ├── pages/     # StudentDashboard, TeacherDashboard, AdminDashboard, Login
│   │   └── assets/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── eslint.config.js
├── backend/           # Node.js + Express + Socket.io (to be built)
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── models/
│       ├── middleware/
│       └── socket/
├── ai-service/        # Python + Flask (to be built)
│   └── face_recognition/   # existing local script — wrap into Flask
│       └── smart_attendance_system/
├── database/          # PostgreSQL migrations + seeds
│   ├── migrations/
│   └── seeds/
├── docs/              # API spec and architecture docs
├── .claude/           # Hooks and subagent config
├── .github/workflows/ # CI pipeline
├── docker-compose.yml
└── CLAUDE.md
```

---

## Current State
- ✅ `frontend/` — React dashboards built, deployed on Vercel. All mock data, no real API calls yet.
- ✅ `ai-service/face_recognition/` — Working local Python script (OpenCV + dlib). Not yet wrapped in Flask.
- ❌ `backend/` — Empty. Node/Express server not built yet.
- ❌ `database/` — Empty. Schema not written yet.
- ❌ Auth — Not implemented anywhere.
- ❌ Docker — Not set up yet.

---

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build
npm run lint
```

### Backend (once built)
```bash
cd backend
npm install
npm run dev        # http://localhost:3001
npm test
```

### AI Service (once built)
```bash
cd ai-service
pip install -r requirements.txt
python app.py      # http://localhost:5000
pytest
```

### Database
```bash
cd database
npm run migrate    # run all pending migrations
npm run seed       # dev only
```

### Full stack
```bash
docker-compose up
```

---

## Environment Variables

### backend/.env
```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eshiksha
JWT_SECRET=change_this_to_a_random_secret
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:5000
SOCKET_CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### ai-service/.env
```
FLASK_PORT=5000
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eshiksha
ANTHROPIC_API_KEY=your_key_here
FACE_MODEL_PATH=./face_recognition/model/
FACE_RECOGNITION_THRESHOLD=0.6
```

### frontend/.env
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

---

## Code Conventions

### General
- No hardcoded secrets — always use environment variables
- Descriptive variable names — no single-letter vars outside loops
- Every exported function needs a JSDoc (JS) or docstring (Python)

### Frontend (React)
- All API calls go through `frontend/src/api/` — never `fetch()` directly in components
- Use Tailwind utility classes — no inline styles
- Always check `user.role` before rendering sensitive UI elements
- Components in `src/components/`, pages in `src/pages/`

### Backend (Node/Express)
- Routes in `src/routes/` — thin, just define path + call controller
- Business logic in `src/controllers/`
- DB queries in `src/models/`
- All routes go through `authMiddleware` unless explicitly public
- Consistent JSON responses: `{ success: true, data: {} }` or `{ success: false, error: "" }`

### AI Service (Flask)
- Two modules: `face_recognition/` and `task_suggestions/`
- All endpoints prefixed `/api/v1/`
- Validate all inputs with marshmallow schemas

### Database
- Migration files named sequentially: `001_create_users.sql`, `002_create_classes.sql`
- Never edit existing migration files — always create a new one
- All timestamps in UTC
- Soft deletes only — never hard delete student or attendance records

---

## Architecture Rules
- Frontend never talks directly to the AI service — always routes through backend
- Backend is the single auth source — Flask trusts tokens issued by Node
- QR tokens expire after 30 seconds and are never reusable
- Facial recognition always has a QR fallback
- Student PII encrypted at rest

---

## Database Schema (planned)
- `users` — id, name, role (student|teacher|admin), email, password_hash
- `classes` — id, name, teacher_id, schedule
- `timetable_entries` — id, class_id, day, start_time, end_time
- `attendance_records` — id, student_id, class_id, date, method (qr|face), timestamp
- `qr_tokens` — id, class_id, token, expires_at
- `task_suggestions` — id, student_id, free_period_id, suggestion, status (pending|accepted|completed)
- `resources` — id, teacher_id, class_id, file_url, description
- `student_profiles` — id, student_id, interests, career_goal, performance_data (jsonb)

---

## Subagent Boundaries
| Agent | Owns | Never touches |
|---|---|---|
| `backend-agent` | `backend/`, `database/` | `frontend/`, `ai-service/` |
| `frontend-agent` | `frontend/` | `backend/`, `ai-service/`, `database/` |
| `ai-agent` | `ai-service/` | `frontend/`, `backend/`, `database/` |
| `devops-agent` | `docker-compose*.yml`, `.github/`, `*/Dockerfile` | `*/src/` |

Agents communicate only via the API contract in `docs/api-spec.md`.

---

## Git Conventions

### Branch naming
```
feature/short-description
fix/short-description
chore/short-description
```

### Commit format
```
feat: add QR token expiry via Socket.io
fix: prevent duplicate attendance records
chore: add eslint config
```

### Workflow
- `main` — production only
- `develop` — integration branch, all features merge here first
- `feature/*` — individual feature branches, PR into develop

### Never commit
- `.env` files
- `node_modules/`
- `__pycache__/`
- `*.dat` model weight files (too large — store separately)
- Any real student data

---

## Do Not Touch
- `frontend/src/assets/` — design assets from SIH
- `ai-service/face_recognition/smart_attendance_system/` — existing working script, only wrap don't rewrite
- Any existing migration file in `database/migrations/`
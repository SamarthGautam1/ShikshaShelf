# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev        # Start Vite dev server with HMR

# Build & preview
npm run build      # Production build → /dist
npm run preview    # Preview production build locally

# Linting
npm run lint       # ESLint check
```

### Python Face Recognition Backend

```bash
cd "Face recognition"
python -m venv attendance_env
attendance_env\Scripts\activate        # Windows
pip install -r requirements.txt
cd smart_attendance_system
python custom_attendance.py
```

## Architecture

### Frontend (React + Vite)

**App.jsx** is the root — it manages role selection state and conditionally renders one of three dashboards. There is no router library in use despite `react-router-dom` being installed.

**Role-based routing:**
- `Login.jsx` → user picks Teacher / Student / Administrator
- `App.jsx` maps the role to the corresponding dashboard page
- Logout callbacks are passed as props from `App.jsx` down to each dashboard

**Pages** (`src/pages/`):
- `StudentDashboard.jsx` — multi-tab UI (My Day, Attendance, Performance, Resources, Assignments, Ask a Doubt), QR code scanning for attendance, Recharts visualizations
- `TeacherDashboard.jsx` — attendance session management via QR code generation, performance analytics, at-risk student alerts
- `AdminDashboard.jsx` — system-wide stats, user management, academic calendar
- `TD.jsx` — alternate teacher dashboard (parallel implementation)
- `QRScannerModal.jsx` — wraps `html5-qrcode` for camera-based QR scanning

**Attendance synchronization:** Teacher and student dashboards communicate across browser tabs using the `BroadcastChannel` API. The teacher starts a QR session and broadcasts it; the student dashboard listens and updates attendance state.

**Data:** All dashboards use hardcoded mock data. There is no API integration in the frontend.

**Styling:** Tailwind CSS utility classes inline on all components. Icons are inline SVG functional components defined within each page file.

### Python Backend (isolated)

Lives in `Face recognition/` and is completely independent of the frontend. It uses OpenCV + dlib for face detection/recognition and pandas for attendance logging. Student photos go in `smart_attendance_system/student_photos/`.

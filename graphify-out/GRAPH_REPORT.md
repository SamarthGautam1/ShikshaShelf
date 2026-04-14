# Graph Report - .  (2026-04-14)

## Corpus Check
- Corpus is ~25,022 words - fits in a single context window. You may not need a graph.

## Summary
- 239 nodes · 221 edges · 47 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AI Service & Project Core|AI Service & Project Core]]
- [[_COMMUNITY_Teacher Dashboard UI|Teacher Dashboard UI]]
- [[_COMMUNITY_Face Recognition Engine|Face Recognition Engine]]
- [[_COMMUNITY_Student Dashboard UI|Student Dashboard UI]]
- [[_COMMUNITY_Task Suggestion Routes|Task Suggestion Routes]]
- [[_COMMUNITY_Teacher Dashboard (TD)|Teacher Dashboard (TD)]]
- [[_COMMUNITY_Custom Attendance System|Custom Attendance System]]
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Flask App Entry Point|Flask App Entry Point]]
- [[_COMMUNITY_Architecture & Tech Stack|Architecture & Tech Stack]]
- [[_COMMUNITY_Brand & Visual Assets|Brand & Visual Assets]]
- [[_COMMUNITY_Timetable Controller|Timetable Controller]]
- [[_COMMUNITY_Timetable Model|Timetable Model]]
- [[_COMMUNITY_Task Suggestion Generator|Task Suggestion Generator]]
- [[_COMMUNITY_Attendance API Client|Attendance API Client]]
- [[_COMMUNITY_React App Shell|React App Shell]]
- [[_COMMUNITY_Auth API Client|Auth API Client]]
- [[_COMMUNITY_QR Scanner Modal|QR Scanner Modal]]
- [[_COMMUNITY_Parent Package Script|Parent Package Script]]
- [[_COMMUNITY_Task Suggestions Init|Task Suggestions Init]]
- [[_COMMUNITY_Tasks Controller|Tasks Controller]]
- [[_COMMUNITY_Database Connection|Database Connection]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Error Handler|Error Handler]]
- [[_COMMUNITY_Auth Routes|Auth Routes]]
- [[_COMMUNITY_Socket.io Handlers|Socket.io Handlers]]
- [[_COMMUNITY_DB Migration Runner|DB Migration Runner]]
- [[_COMMUNITY_Classes API Client|Classes API Client]]
- [[_COMMUNITY_Timetable API Client|Timetable API Client]]
- [[_COMMUNITY_Attendance Socket Hook|Attendance Socket Hook]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_Backend Verify Script|Backend Verify Script]]
- [[_COMMUNITY_Config Settings|Config Settings]]
- [[_COMMUNITY_Backend Server Entry|Backend Server Entry]]
- [[_COMMUNITY_Attendance Routes|Attendance Routes]]
- [[_COMMUNITY_Classes Routes|Classes Routes]]
- [[_COMMUNITY_Route Index|Route Index]]
- [[_COMMUNITY_Tasks Routes|Tasks Routes]]
- [[_COMMUNITY_Timetable Routes|Timetable Routes]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_React Main Entry|React Main Entry]]
- [[_COMMUNITY_API Base Config|API Base Config]]
- [[_COMMUNITY_Docker Deployment|Docker Deployment]]
- [[_COMMUNITY_Admin Analytics|Admin Analytics]]

## God Nodes (most connected - your core abstractions)
1. `CustomFaceRecognition` - 11 edges
2. `CustomFaceRecognition` - 9 edges
3. `TaskSuggestionInputSchema` - 5 edges
4. `Python + Flask AI Service` - 5 edges
5. `Monorepo Architecture` - 5 edges
6. `main()` - 4 edges
7. `main()` - 4 edges
8. `Teacher Attendance System` - 4 edges
9. `AI Task Suggestions` - 4 edges
10. `Local Face Recognition Script` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Two-Mode Attendance Hub` --semantically_similar_to--> `Teacher Attendance System`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Productivity Insights Dashboard` --semantically_similar_to--> `Student Productivity Engine`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `QR Attendance Scanner` --semantically_similar_to--> `QR Code Attendance`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Local Face Recognition Script` --semantically_similar_to--> `Facial Recognition Attendance`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Smart Task Suggestions Feature` --semantically_similar_to--> `AI Task Suggestions`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md

## Hyperedges (group relationships)
- **Attendance System Pipeline** — claude_teacher_attendance, claude_qr_attendance, claude_facial_recognition, readme_teacher_attendance_hub, readme_face_recognition_local [EXTRACTED 0.90]
- **AI Productivity Engine** — claude_student_productivity, claude_ai_task_suggestions, readme_smart_task_suggestions, readme_my_day_view, ai_reqs_anthropic [EXTRACTED 0.85]
- **Architecture Decision Records** — claude_rationale_backend_auth_source, claude_rationale_qr_expiry, claude_rationale_soft_deletes, claude_rationale_no_direct_ai [EXTRACTED 0.90]

## Communities

### Community 0 - "AI Service & Project Core"
Cohesion: 0.09
Nodes (23): Anthropic SDK Dependency, Flask Dependency, Marshmallow Validation, AI Task Suggestions, E-Shiksha Project, Facial Recognition Attendance, Python + Flask AI Service, QR Code Attendance (+15 more)

### Community 1 - "Teacher Dashboard UI"
Cohesion: 0.1
Nodes (0): 

### Community 2 - "Face Recognition Engine"
Cohesion: 0.17
Nodes (9): CustomFaceRecognition, main(), Get center point of a face for tracking, Find the closest tracked face to avoid re-recognition, FIXED: Synchronous face recognition to avoid timing issues, Save attendance to CSV, Run the attendance system - SYNCHRONIZATION FIXED, Get face encoding using dlib models (+1 more)

### Community 3 - "Student Dashboard UI"
Cohesion: 0.11
Nodes (0): 

### Community 4 - "Task Suggestion Routes"
Cohesion: 0.15
Nodes (15): generate(), Flask blueprint for task suggestion endpoints., Generate task suggestions for a student's free periods.      Expects a JSON body, Schema, FreePeriodSchema, PeriodSuggestionsSchema, Marshmallow schemas for task suggestion input/output validation., Schema for validating task suggestion generation requests. (+7 more)

### Community 5 - "Teacher Dashboard (TD)"
Cohesion: 0.12
Nodes (0): 

### Community 6 - "Custom Attendance System"
Cohesion: 0.21
Nodes (7): CustomFaceRecognition, main(), Recognize faces in video frame, Save attendance to CSV, Run the attendance system, Get face encoding using dlib models, Load student photos and create encodings

### Community 7 - "Admin Dashboard UI"
Cohesion: 0.17
Nodes (0): 

### Community 8 - "Flask App Entry Point"
Cohesion: 0.2
Nodes (9): health(), internal_error(), method_not_allowed(), not_found(), Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables, Return a simple health check response.      Returns:         JSON with success s, Handle 404 errors with a consistent JSON response., Handle 405 errors with a consistent JSON response. (+1 more)

### Community 9 - "Architecture & Tech Stack"
Cohesion: 0.25
Nodes (9): Node.js + Express + Socket.io Backend, Database Schema Plan, React + Vite + Tailwind Frontend, JWT Authentication, Monorepo Architecture, PostgreSQL Database, Backend as Single Auth Source Rationale, Frontend Never Talks to AI Service Rationale (+1 more)

### Community 10 - "Brand & Visual Assets"
Cohesion: 0.32
Nodes (8): Atharva Bajpai Student Photo, E-Shiksha Brand Identity, E-Shiksha Dashboard Logo, Face Recognition System, Frontend Application, React Logo, Student Photos Dataset, Vite Logo

### Community 11 - "Timetable Controller"
Cohesion: 0.4
Nodes (0): 

### Community 12 - "Timetable Model"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Task Suggestion Generator"
Cohesion: 0.5
Nodes (3): generate_task_suggestions(), Core logic for generating AI-driven task suggestions using the Anthropic API., Generate AI-driven task suggestions for a student's free periods.      Uses the

### Community 14 - "Attendance API Client"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "React App Shell"
Cohesion: 0.67
Nodes (0): 

### Community 16 - "Auth API Client"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "QR Scanner Modal"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Parent Package Script"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Task Suggestions Init"
Cohesion: 1.0
Nodes (1): Task suggestions module for AI-driven learning recommendations.

### Community 20 - "Tasks Controller"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Database Connection"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Auth Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Error Handler"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Auth Routes"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Socket.io Handlers"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "DB Migration Runner"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Classes API Client"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Timetable API Client"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Attendance Socket Hook"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Login Page"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Backend Verify Script"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Config Settings"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Backend Server Entry"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Attendance Routes"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Classes Routes"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Route Index"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Tasks Routes"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Timetable Routes"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "React Main Entry"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "API Base Config"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Docker Deployment"
Cohesion: 1.0
Nodes (1): Docker Deployment

### Community 46 - "Admin Analytics"
Cohesion: 1.0
Nodes (1): School-Wide Analytics

## Knowledge Gaps
- **46 isolated node(s):** `Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables`, `Return a simple health check response.      Returns:         JSON with success s`, `Handle 404 errors with a consistent JSON response.`, `Handle 405 errors with a consistent JSON response.`, `Handle 500 errors with a consistent JSON response.` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Parent Package Script`** (2 nodes): `package_for_parent.py`, `create_project_package()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Task Suggestions Init`** (2 nodes): `__init__.py`, `Task suggestions module for AI-driven learning recommendations.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tasks Controller`** (2 nodes): `tasks.js`, `getSuggestions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Connection`** (2 nodes): `index.js`, `query()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Middleware`** (2 nodes): `authMiddleware()`, `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Handler`** (2 nodes): `errorHandler.js`, `errorHandler()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Routes`** (2 nodes): `signToken()`, `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Socket.io Handlers`** (2 nodes): `index.js`, `registerSocketHandlers()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DB Migration Runner`** (2 nodes): `migrate.js`, `migrate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Classes API Client`** (2 nodes): `getTeacherClasses()`, `classes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Timetable API Client`** (2 nodes): `timetable.js`, `getTodayTimetable()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Attendance Socket Hook`** (2 nodes): `useAttendanceSocket.js`, `useAttendanceSocket()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Page`** (2 nodes): `Login.jsx`, `Login()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Verify Script`** (1 nodes): `verify_backend.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Config Settings`** (1 nodes): `settings.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Server Entry`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Attendance Routes`** (1 nodes): `attendance.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Classes Routes`** (1 nodes): `classes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Route Index`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tasks Routes`** (1 nodes): `tasks.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Timetable Routes`** (1 nodes): `timetable.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `React Main Entry`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Base Config`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Docker Deployment`** (1 nodes): `Docker Deployment`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Analytics`** (1 nodes): `School-Wide Analytics`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Python + Flask AI Service` connect `AI Service & Project Core` to `Architecture & Tech Stack`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Monorepo Architecture` connect `Architecture & Tech Stack` to `AI Service & Project Core`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `TaskSuggestionInputSchema` (e.g. with `Flask blueprint for task suggestion endpoints.` and `Generate task suggestions for a student's free periods.      Expects a JSON body`) actually correct?**
  _`TaskSuggestionInputSchema` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Python + Flask AI Service` (e.g. with `Flask Dependency` and `Marshmallow Validation`) actually correct?**
  _`Python + Flask AI Service` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables`, `Return a simple health check response.      Returns:         JSON with success s`, `Handle 404 errors with a consistent JSON response.` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI Service & Project Core` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Teacher Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
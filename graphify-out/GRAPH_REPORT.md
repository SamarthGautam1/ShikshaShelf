# Graph Report - .  (2026-04-15)

## Corpus Check
- Corpus is ~27,388 words - fits in a single context window. You may not need a graph.

## Summary
- 252 nodes · 238 edges · 49 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Teacher Dashboard UI|Teacher Dashboard UI]]
- [[_COMMUNITY_Gemini Face Recognition|Gemini Face Recognition]]
- [[_COMMUNITY_Student Dashboard UI|Student Dashboard UI]]
- [[_COMMUNITY_Task Suggestion Schemas|Task Suggestion Schemas]]
- [[_COMMUNITY_Teacher Dashboard Alt|Teacher Dashboard Alt]]
- [[_COMMUNITY_Project Architecture Config|Project Architecture Config]]
- [[_COMMUNITY_Custom Face Recognition|Custom Face Recognition]]
- [[_COMMUNITY_Attendance Dependencies|Attendance Dependencies]]
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Flask App Entrypoint|Flask App Entrypoint]]
- [[_COMMUNITY_Project Overview Docs|Project Overview Docs]]
- [[_COMMUNITY_Visual Assets & Branding|Visual Assets & Branding]]
- [[_COMMUNITY_Timetable Controller|Timetable Controller]]
- [[_COMMUNITY_Timetable Model|Timetable Model]]
- [[_COMMUNITY_Task Suggestion Generator|Task Suggestion Generator]]
- [[_COMMUNITY_Attendance API Client|Attendance API Client]]
- [[_COMMUNITY_React App Shell|React App Shell]]
- [[_COMMUNITY_Auth API Client|Auth API Client]]
- [[_COMMUNITY_Timetable API Client|Timetable API Client]]
- [[_COMMUNITY_QR Scanner Modal|QR Scanner Modal]]
- [[_COMMUNITY_Package Helper Script|Package Helper Script]]
- [[_COMMUNITY_Task Suggestions Init|Task Suggestions Init]]
- [[_COMMUNITY_Tasks Controller|Tasks Controller]]
- [[_COMMUNITY_Database Connection|Database Connection]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Error Handler|Error Handler]]
- [[_COMMUNITY_Auth Routes|Auth Routes]]
- [[_COMMUNITY_Socket Handler|Socket Handler]]
- [[_COMMUNITY_Database Migrations|Database Migrations]]
- [[_COMMUNITY_Classes API Client|Classes API Client]]
- [[_COMMUNITY_Attendance Socket Hook|Attendance Socket Hook]]
- [[_COMMUNITY_Login Page|Login Page]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `CustomFaceRecognition` - 11 edges
2. `CustomFaceRecognition` - 9 edges
3. `Monorepo Architecture` - 7 edges
4. `Python + Flask AI Service` - 7 edges
5. `Local Face Recognition Script` - 7 edges
6. `TaskSuggestionInputSchema` - 5 edges
7. `E-Shiksha Project` - 5 edges
8. `Node.js + Express + Socket.io Backend` - 5 edges
9. `main()` - 4 edges
10. `main()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Two-Mode Attendance Hub` --semantically_similar_to--> `Teacher Attendance System`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Productivity Insights Dashboard` --semantically_similar_to--> `Student Productivity Engine`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `QR Attendance Scanner` --semantically_similar_to--> `QR Code Attendance`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Smart Task Suggestions Feature` --semantically_similar_to--> `AI Task Suggestions`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Flask blueprint for task suggestion endpoints.` --uses--> `TaskSuggestionInputSchema`  [INFERRED]
  ai-service\task_suggestions\routes.py → ai-service\task_suggestions\schemas.py

## Hyperedges (group relationships)
- **Attendance System Pipeline** — claude_teacher_attendance, claude_qr_attendance, claude_facial_recognition, readme_teacher_attendance_hub, readme_face_recognition_local, face_reqs_opencv, face_reqs_dlib [EXTRACTED 0.90]
- **AI Productivity Engine** — claude_student_productivity, claude_ai_task_suggestions, readme_smart_task_suggestions, readme_my_day_view, ai_reqs_groq [EXTRACTED 0.85]
- **Architecture Decision Records** — claude_rationale_backend_auth, claude_rationale_qr_expiry, claude_rationale_soft_deletes, claude_rationale_no_direct_ai, claude_rationale_pii_encryption [EXTRACTED 0.90]

## Communities

### Community 0 - "Teacher Dashboard UI"
Cohesion: 0.1
Nodes (0): 

### Community 1 - "Gemini Face Recognition"
Cohesion: 0.17
Nodes (9): CustomFaceRecognition, main(), Get center point of a face for tracking, Find the closest tracked face to avoid re-recognition, FIXED: Synchronous face recognition to avoid timing issues, Save attendance to CSV, Run the attendance system - SYNCHRONIZATION FIXED, Get face encoding using dlib models (+1 more)

### Community 2 - "Student Dashboard UI"
Cohesion: 0.11
Nodes (0): 

### Community 3 - "Task Suggestion Schemas"
Cohesion: 0.15
Nodes (15): generate(), Flask blueprint for task suggestion endpoints., Generate task suggestions for a student's free periods.      Expects a JSON body, Schema, FreePeriodSchema, PeriodSuggestionsSchema, Marshmallow schemas for task suggestion input/output validation., Schema for validating task suggestion generation requests. (+7 more)

### Community 4 - "Teacher Dashboard Alt"
Cohesion: 0.12
Nodes (0): 

### Community 5 - "Project Architecture Config"
Cohesion: 0.15
Nodes (17): Flask Dependency, Groq SDK Dependency, Marshmallow Dependency, Python + Flask AI Service, Node.js + Express + Socket.io Backend, PostgreSQL Database, Database Schema Plan, Docker Deployment (+9 more)

### Community 6 - "Custom Face Recognition"
Cohesion: 0.21
Nodes (7): CustomFaceRecognition, main(), Recognize faces in video frame, Save attendance to CSV, Run the attendance system, Get face encoding using dlib models, Load student photos and create encodings

### Community 7 - "Attendance Dependencies"
Cohesion: 0.15
Nodes (14): Facial Recognition Attendance, QR Code Attendance, QR Token 30s Expiry Rationale, Teacher Attendance System, Face Recognition Setup Guide, CMake Dependency, Dlib Dependency, NumPy Dependency (+6 more)

### Community 8 - "Admin Dashboard UI"
Cohesion: 0.17
Nodes (0): 

### Community 9 - "Flask App Entrypoint"
Cohesion: 0.2
Nodes (9): health(), internal_error(), method_not_allowed(), not_found(), Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables, Return a simple health check response.      Returns:         JSON with success s, Handle 404 errors with a consistent JSON response., Handle 405 errors with a consistent JSON response. (+1 more)

### Community 10 - "Project Overview Docs"
Cohesion: 0.2
Nodes (10): AI Task Suggestions, E-Shiksha Project, Student Productivity Engine, Graph Report Summary, E-Shiksha README, My Day View Feature, Productivity Insights Dashboard, Smart India Hackathon 2025 (+2 more)

### Community 11 - "Visual Assets & Branding"
Cohesion: 0.27
Nodes (10): Atharva Bajpai (Student), Atharva Bajpai - Student Photo, E-Shiksha Education Platform, Face Recognition Attendance System, Frontend Module, E-Shiksha Dashboard Logo, React, React Logo (UI Framework) (+2 more)

### Community 12 - "Timetable Controller"
Cohesion: 0.4
Nodes (0): 

### Community 13 - "Timetable Model"
Cohesion: 0.4
Nodes (0): 

### Community 14 - "Task Suggestion Generator"
Cohesion: 0.5
Nodes (3): generate_task_suggestions(), Core logic for generating AI-driven task suggestions using the Groq API., Generate AI-driven task suggestions for a student's free periods.      Uses the

### Community 15 - "Attendance API Client"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "React App Shell"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Auth API Client"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Timetable API Client"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "QR Scanner Modal"
Cohesion: 0.67
Nodes (0): 

### Community 20 - "Package Helper Script"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Task Suggestions Init"
Cohesion: 1.0
Nodes (1): Task suggestions module for AI-driven learning recommendations.

### Community 22 - "Tasks Controller"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Database Connection"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Auth Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Error Handler"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Auth Routes"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Socket Handler"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Database Migrations"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Classes API Client"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Attendance Socket Hook"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Login Page"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): School-Wide Analytics

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Python-Dotenv Dependency

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): Pillow Dependency

## Knowledge Gaps
- **50 isolated node(s):** `Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables`, `Return a simple health check response.      Returns:         JSON with success s`, `Handle 404 errors with a consistent JSON response.`, `Handle 405 errors with a consistent JSON response.`, `Handle 500 errors with a consistent JSON response.` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Package Helper Script`** (2 nodes): `package_for_parent.py`, `create_project_package()`
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
- **Thin community `Socket Handler`** (2 nodes): `index.js`, `registerSocketHandlers()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Migrations`** (2 nodes): `migrate.js`, `migrate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Classes API Client`** (2 nodes): `getTeacherClasses()`, `classes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Attendance Socket Hook`** (2 nodes): `useAttendanceSocket.js`, `useAttendanceSocket()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Page`** (2 nodes): `Login.jsx`, `Login()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `verify_backend.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `settings.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `attendance.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `classes.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `tasks.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `timetable.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `School-Wide Analytics`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `Python-Dotenv Dependency`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Pillow Dependency`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `E-Shiksha Project` connect `Project Overview Docs` to `Project Architecture Config`, `Attendance Dependencies`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Monorepo Architecture` connect `Project Architecture Config` to `Project Overview Docs`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `Teacher Attendance System` connect `Attendance Dependencies` to `Project Overview Docs`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Python + Flask AI Service` (e.g. with `Flask Dependency` and `Groq SDK Dependency`) actually correct?**
  _`Python + Flask AI Service` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Flask entry point for the E-शिक्षा AI microservice.  Loads environment variables`, `Return a simple health check response.      Returns:         JSON with success s`, `Handle 404 errors with a consistent JSON response.` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Teacher Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Student Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
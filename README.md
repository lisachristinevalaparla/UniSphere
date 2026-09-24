# 🎓 UniSphere — AI-Powered University Super-App

UniSphere is a modern, unified university management platform and AI-driven academic workspace. It centralizes student coursework, live attendance tracking, examinations, course materials, club events, and campus placements, augmented by an intelligent **Claude-powered AI Academic Advisor** grounded in live institutional database records.

---

## 🌟 Key Features

### 1. 🤖 AI University Assistant (Backend-Grounding)
- **Context-Aware Chat (`POST /api/ai/chat`)**: Queries live MongoDB data (attendance %, unsubmitted assignments, upcoming exam schedules) and provides real-time, grounded advice.
- **Document Summarizer (`POST /api/ai/summarize`)**: Accepts lecture PDFs or text and generates structured summaries (Key Concepts, Core Formulas, High-Yield Exam Questions, and Cheat Sheets).
- **Smart Study Planner (`POST /api/ai/study-plan`)**: Generates tailored, day-by-day revision timetables prioritized by impending exam dates and attendance needs.
- **Placement & Interview Prep (`POST /api/ai/placement-prep`)**: Role and company-specific interview roadmap with top coding topics, STAR method frameworks, and 7-day sprint checklists.
- **Global Floating AI Widget**: Quick-access AI assistant floating widget available across all pages.

### 2. 🎨 Hybrid Minimalism + Glassmorphism Design System
- **Indigo & Slate Palette**:
  - `primary`: `#4f46e5` (Indigo-600)
  - `surface`: `#ffffff` (Light) / `#0f172a` (Dark)
  - `muted`: `#f8fafc` (Light) / `#1e293b` (Dark)
- **Standardized Status Tokens**:
  - `success`: `#10b981` (Good attendance $\ge$ 75%, on-time submissions)
  - `warning`: `#f59e0b` (Pending deadlines, attendance 65–74%)
  - `danger`: `#ef4444` (Low attendance shortage $<$ 65%, overdue)
  - `info`: `#3b82f6` (General notices, schedules)
- **Selective Glassmorphism**: High-impact surfaces (`glass-panel`, `backdrop-blur-md`, soft ambient gradients) for the AI Chat Panel, Auth Cards, and Dashboard Summary Cards.
- **Flat Minimalism**: Clean, high-legibility layouts for dense data views (attendance logs, marks tables, assignment lists).
- **Dark Mode**: Persistent light/dark mode with toggle in navigation.

### 3. 📚 Core Academic Modules
- **Attendance Management**: Subject-wise tracking, percentage auto-computation, and shortage alerts.
- **Assignments & Submissions**: Faculty grading, PDF/document attachments, and status tracking.
- **Examinations & Results**: Schedule timetables, automatic GPA/grade computation, and marks publishing.
- **Course Materials**: Subject-wise resource repository with PDF preview and AI summarization.
- **Events & Clubs**: Campus-wide hackathons, guest lectures, and membership management.
- **Campus Placements**: Placement drive listings, eligibility checking, and application tracking.
- **Institutional Analytics**: Administrator dashboard with campus-wide attendance trends and submission compliance rates.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React, Zustand, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose, Multer, `pdf-parse`
- **AI Engine**: Anthropic Claude API (`@anthropic-ai/sdk`) with intelligent academic fallback
- **Authentication**: JWT (Access Token + HttpOnly Refresh Token rotation) & BCrypt password hashing

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas cluster connection URI

### 2. Backend Setup
```bash
cd unisphere/server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and supply your MONGODB_URI and JWT secrets

# Start development server
npm run dev
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd unisphere/client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📖 AI API Reference (`/api/ai`)

All AI endpoints require a valid JWT Bearer token in the `Authorization` header.

### 1. `POST /api/ai/chat`
- **Body**: `{ "message": "What should I focus on this week?", "conversationHistory": [...] }`
- **Response**:
```json
{
  "reply": "Based on your live records in Computer Science...",
  "groundedContext": {
    "attendanceAverage": 82,
    "pendingAssignmentsCount": 2,
    "upcomingExamsCount": 1
  }
}
```

### 2. `POST /api/ai/summarize`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Parameters**: `file` (PDF/TXT) OR `text` (String) OR `materialId` (MongoDB ObjectId)
- **Response**:
```json
{
  "title": "Operating Systems Unit 3",
  "wordCount": 1420,
  "summary": "### 📌 Executive Overview..."
}
```

### 3. `POST /api/ai/study-plan`
- **Body**: `{ "days": 7, "dailyHours": 4, "targetSubject": "Operating Systems" }`
- **Response**: `{ "days": 7, "dailyHours": 4, "studyPlan": "..." }`

### 4. `POST /api/ai/placement-prep`
- **Body**: `{ "company": "Google", "role": "Software Engineer", "skills": ["DSA", "System Design"] }`
- **Response**: `{ "company": "Google", "role": "Software Engineer", "prepGuide": "..." }`

---

## 🔒 Security Best Practices
- The Anthropic API key and database credentials reside **strictly on the backend**.
- `.env` files are ignored by `.gitignore`.
- Role-based route authorization (`student`, `faculty`, `admin`) enforced at middleware level.

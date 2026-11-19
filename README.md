# AI Interviewer – Smart Interview Preparation System

A full-stack, enterprise-grade AI-powered online interview platform designed to help candidates practice realistic technical, HR, coding, and aptitude interviews, gain confidence, and receive instant rubric evaluations.

![AI Interviewer](public/logo.svg)

---

## 🌟 Key Features

1. **Dynamic Gemini AI Questioning**:
   - Live generation of role-specific interview questions based on job role, experience level, difficulty, and language.
   - Intelligent adaptive follow-up questioning based on previous candidate answers.
   - Dynamically scales difficulty (Easy, Medium, Hard) according to candidate performance.

2. **Conversational Voice AI**:
   - **Speech-to-Text**: Real-time microphone listening via Web Speech API with live visual audio waveforms.
   - **Text-to-Speech**: AI Interviewer speaks questions aloud in a natural voice.
   - **Multi-Language Support**: Seamless interviews in **English**, **Kannada**, and **Hindi**.

3. **6-Factor AI Answer Evaluation**:
   - Evaluates:
     - Relevance of the answer
     - Technical correctness
     - Communication quality & articulation
     - Answer clarity
     - Completeness
     - Problem-solving approach
   - Instant score out of 10, positive feedback callout, areas for improvement, and exemplary model answers.

4. **Multi-Language Coding Arena**:
   - Code editor supporting **C**, **C++**, **Python**, and **Java** powered by Monaco Editor.
   - Algorithmic interview problem library with test case inputs/outputs.
   - Secure execution proxy connected to an isolated container runner.
   - AI Code Review diagnosing Big-O time and space complexity, syntax errors, and optimization opportunities.

5. **Resume-Based Interview Generator**:
   - Upload PDF resumes to extract skills, technologies, experience, and past projects.
   - Gemini crafts personalized questions probing the candidate's actual projects.

6. **Executive PDF Performance Report**:
   - Comprehensive performance assessment dossier with overall score (0–100).
   - Question-by-question breakdown, strengths, weaknesses, and study recommendations.
   - One-click vector PDF download with branded headers using jsPDF & autoTable.

7. **Student & Admin Dashboards**:
   - **Student Dashboard**: Completed interview metrics, progress timeline charts (Recharts), track scores, and recent history.
   - **Admin Console**: Platform usage statistics, registered candidate management, service telemetry, and category controls.

8. **Secure Authentication & Database**:
   - Supabase Auth + PostgreSQL with Row Level Security (RLS).
   - Built-in graceful local fallback mode allowing full testing and demo accounts out of the box.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Visuals & Charts**: Recharts, Canvas-Confetti
- **Document Export**: jsPDF, jsPDF-AutoTable
- **Backend**: Node.js, Express, TypeScript, Multer, PDF-Parse
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Database**: Supabase PostgreSQL with RLS (`supabase/schema.sql`)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
> *Note: If no Gemini key is provided, the platform automatically activates its high-precision smart heuristic generator, ensuring zero downtime.*

### 3. Run Development Server
```bash
# Starts both frontend (Vite: http://localhost:5173) and backend (Express: http://localhost:5000)
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

To set up the Supabase database with Row Level Security:
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. The schema creates:
   - `profiles`
   - `resumes`
   - `interviews`
   - `interview_questions`
   - `interview_answers`
   - `interview_reports`
   - Row Level Security (RLS) policies allowing candidates to only access their own private interview history.

---

## 👥 Demo Logins

For instant review and role testing:
- **Student Demo**: `candidate@aiinterviewer.com` (Alex Morgan)
- **Admin Demo**: `shivuba005@gmail.com` (Shivu)
- Quick role switcher is also accessible in the top navigation bar!


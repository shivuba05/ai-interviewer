import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, FinalInterviewReport, ResumeData, InterviewSetupConfig } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.trim() !== '' && supabaseAnonKey && supabaseAnonKey.trim() !== ''
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Storage Fallback Store (Used when Supabase is not configured)
const LOCAL_STORAGE_KEYS = {
  USERS: 'ai_interviewer_users',
  CURRENT_USER: 'ai_interviewer_current_user',
  REPORTS: 'ai_interviewer_reports',
  RESUMES: 'ai_interviewer_resumes',
  INTERVIEWS: 'ai_interviewer_interviews',
};

// Default Demo User
export const DEMO_USER: UserProfile = {
  id: 'usr-demo-001',
  email: 'candidate@aiinterviewer.com',
  fullName: 'Alex Morgan',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  targetRole: 'Software Developer',
  experienceLevel: 'Fresher',
  preferredLanguage: 'English',
  createdAt: new Date().toISOString(),
};

// Default Demo Admin
export const DEMO_ADMIN: UserProfile = {
  id: 'usr-admin-001',
  email: 'shivuba005@gmail.com',
  fullName: 'Shivu (Platform Admin)',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  targetRole: 'Engineering Manager & Lead Interviewer',
  experienceLevel: 'Experienced',
  preferredLanguage: 'English',
  createdAt: new Date().toISOString(),
};

// Seed initial reports for realistic dashboard visuals on first launch
const INITIAL_SAMPLE_REPORTS: FinalInterviewReport[] = [
  {
    id: 'rep-001',
    interviewId: 'int-001',
    userId: 'usr-demo-001',
    overallScore: 86.5,
    jobRole: 'Software Developer',
    interviewType: 'Technical',
    experienceLevel: 'Fresher',
    durationSeconds: 940,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    strengths: [
      'Excellent explanation of database indexing tradeoffs',
      'Articulate understanding of asynchronous promise handling',
      'Logical problem-solving methodology',
    ],
    weaknesses: [
      'Did not mention cache invalidation strategies',
      'Brief explanation of deadlock prevention',
    ],
    technicalKnowledgeAssessment:
      'The candidate demonstrated strong CS fundamentals, clear object-oriented design knowledge, and practical familiarity with REST APIs.',
    communicationFeedback:
      'Spoke with steady pace and high clarity. Good structured answers using concrete examples.',
    improvementSuggestions: [
      'Practice drawing architecture diagrams while speaking',
      'Deep dive into Distributed ACID and CAP theorem',
    ],
    recommendedTopics: ['Database Sharding', 'System Design Primitives', 'Redis Caching'],
    summary:
      'Overall strong performance for a fresher software developer. High potential for junior backend or fullstack engineering roles.',
    answers: [
      {
        questionId: 'q-1',
        questionText: 'Explain the SOLID principles and how you apply Single Responsibility in practice.',
        answerText:
          'SOLID principles help make code maintainable and extensible. Single Responsibility means a class should have one reason to change, separating business logic from database access.',
        timeSpentSeconds: 120,
        evaluation: {
          score: 8.8,
          relevanceScore: 9.0,
          technicalScore: 8.5,
          communicationScore: 9.0,
          clarityScore: 8.8,
          completenessScore: 8.5,
          problemSolvingScore: 8.7,
          positiveFeedback: 'Great clarity on separation of concerns.',
          areasForImprovement: 'Could mention how testing becomes easier with SRP.',
          suggestedBetterAnswer:
            'A class should have one, and only one, reason to change. For example, an Invoice class should calculate totals, while an InvoicePrinter handles rendering and an InvoiceRepository handles persistence.',
        },
      },
      {
        questionId: 'q-2',
        questionText: 'How do database indexes work internally, and what are their trade-offs?',
        answerText:
          'Indexes typically use B-Trees to allow logarithmic lookup time. The trade-off is slower writes because the index tree must be updated on INSERT and UPDATE.',
        timeSpentSeconds: 150,
        evaluation: {
          score: 8.5,
          relevanceScore: 8.8,
          technicalScore: 8.5,
          communicationScore: 8.5,
          clarityScore: 8.5,
          completenessScore: 8.2,
          problemSolvingScore: 8.5,
          positiveFeedback: 'Correctly identified B-Tree structure and write overhead.',
          areasForImprovement: 'Mention composite indexing and index bloat.',
          suggestedBetterAnswer:
            'Indexes create ordered auxiliary structures (like B+ Trees) enabling O(log N) searches. Trade-offs include additional disk storage and write latency overhead.',
        },
      },
    ],
  },
  {
    id: 'rep-002',
    interviewId: 'int-002',
    userId: 'usr-demo-001',
    overallScore: 91.0,
    jobRole: 'Web Developer',
    interviewType: 'HR',
    experienceLevel: 'Fresher',
    durationSeconds: 720,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    strengths: [
      'Very clear articulation using the STAR technique',
      'Demonstrated collaborative teamwork attitude',
      'High self-awareness and eagerness to learn',
    ],
    weaknesses: ['Could ask more proactive questions about company culture'],
    technicalKnowledgeAssessment:
      'N/A - HR behavioral assessment. Candidate demonstrated high cultural alignment, integrity, and proactive communication.',
    communicationFeedback:
      'Polished and courteous tone with excellent eye contact and concise narrative structure.',
    improvementSuggestions: ['Prepare 3 insightful questions for the executive leadership'],
    recommendedTopics: ['STAR Method Mastery', 'Behavioral Interview Scenarios', 'Negotiation Basics'],
    summary:
      'Outstanding behavioral interview showing high maturity and genuine enthusiasm for software engineering teamwork.',
    answers: [],
  },
];

// Local Repository Helpers
export const localDb = {
  getUsers(): UserProfile[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    if (!raw) {
      const initial = [DEMO_USER, DEMO_ADMIN];
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(initial));
      return initial;
    }
    const list: UserProfile[] = JSON.parse(raw);
    const updated = list.map((u) => (u.role === 'admin' ? { ...u, fullName: DEMO_ADMIN.fullName, email: DEMO_ADMIN.email, avatarUrl: DEMO_ADMIN.avatarUrl } : u));
    return updated;
  },

  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      return null;
    }
    const parsed: UserProfile = JSON.parse(raw);
    if (parsed.role === 'admin' || parsed.email.toLowerCase().trim() === 'shivuba005@gmail.com') {
      return { ...parsed, fullName: DEMO_ADMIN.fullName, email: DEMO_ADMIN.email, avatarUrl: DEMO_ADMIN.avatarUrl };
    }
    return parsed;
  },

  setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  },

  updateUserProfile(updated: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const merged = { ...current, ...updated };
    this.setCurrentUser(merged);

    const users = this.getUsers().map((u) => (u.id === merged.id ? merged : u));
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    return merged;
  },

  getReports(userId?: string): FinalInterviewReport[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.REPORTS);
    let list: FinalInterviewReport[] = raw ? JSON.parse(raw) : [];
    if (list.length === 0) {
      list = INITIAL_SAMPLE_REPORTS;
      localStorage.setItem(LOCAL_STORAGE_KEYS.REPORTS, JSON.stringify(list));
    }
    if (userId) {
      return list.filter((r) => r.userId === userId);
    }
    return list;
  },

  saveReport(report: FinalInterviewReport) {
    const list = this.getReports();
    const updated = [report, ...list.filter((r) => r.id !== report.id)];
    localStorage.setItem(LOCAL_STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  },

  getResumes(userId?: string): ResumeData[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.RESUMES);
    const list: ResumeData[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return list.filter((r) => r.userId === userId);
    }
    return list;
  },

  saveResume(resume: ResumeData) {
    const list = this.getResumes();
    const updated = [resume, ...list.filter((r) => r.id !== resume.id)];
    localStorage.setItem(LOCAL_STORAGE_KEYS.RESUMES, JSON.stringify(updated));
  },

  deleteResume(resumeId: string) {
    const list = this.getResumes();
    const updated = list.filter((r) => r.id !== resumeId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.RESUMES, JSON.stringify(updated));
  },
};


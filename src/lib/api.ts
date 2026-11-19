import {
  InterviewSetupConfig,
  QuestionItem,
  AnswerEvaluation,
  FinalInterviewReport,
  InterviewAnswerRecord,
} from '../types';

const API_BASE = '/api';

// Retrieve stored runtime key if the user entered one in the app
export function getRuntimeGeminiKey(): string | null {
  return localStorage.getItem('ai_interviewer_gemini_key') || null;
}

export function setRuntimeGeminiKey(key: string | null) {
  if (key && key.trim()) {
    localStorage.setItem('ai_interviewer_gemini_key', key.trim());
  } else {
    localStorage.removeItem('ai_interviewer_gemini_key');
  }
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const runtimeKey = getRuntimeGeminiKey();
  if (runtimeKey) {
    headers['x-gemini-key'] = runtimeKey;
  }
  return headers;
}

export interface HealthResponse {
  status: string;
  geminiConfigured: boolean;
  supabaseConfigured: boolean;
  version: string;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      geminiConfigured: Boolean(getRuntimeGeminiKey()),
      supabaseConfigured: false,
      version: '1.0.0',
    };
  }
}

export async function generateQuestionsApi(setup: InterviewSetupConfig): Promise<{ questions: QuestionItem[]; isFallback?: boolean }> {
  const res = await fetch(`${API_BASE}/gemini/generate-questions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      jobRole: setup.jobRole,
      interviewType: setup.interviewType,
      experienceLevel: setup.experienceLevel,
      difficulty: setup.difficulty,
      count: setup.questionCount,
      language: setup.language,
      resumeText: setup.resumeText,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate questions' }));
    throw new Error(err.error || 'Server error generating questions');
  }

  const data = await res.json();
  // Map to QuestionItem format
  const mapped: QuestionItem[] = (data.questions || []).map((q: any, idx: number) => ({
    id: `q-${Date.now()}-${idx + 1}`,
    order: q.order || idx + 1,
    question: q.question,
    expectedPoints: q.expectedPoints || [],
    difficulty: q.difficulty || setup.difficulty,
    category: setup.interviewType,
    isFollowUp: false,
  }));

  return { questions: mapped, isFallback: data.isFallback };
}

export async function generateFollowUpApi(params: {
  jobRole: string;
  question: string;
  candidateAnswer: string;
  language: string;
  currentDifficulty: string;
}): Promise<{ followUp: string; adjustedDifficulty: string }> {
  const res = await fetch(`${API_BASE}/gemini/follow-up`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Failed to generate follow-up question');
  }

  return await res.json();
}

export async function evaluateAnswerApi(params: {
  jobRole: string;
  question: string;
  expectedPoints: string[];
  candidateAnswer: string;
  language: string;
  difficulty: string;
}): Promise<AnswerEvaluation> {
  const res = await fetch(`${API_BASE}/gemini/evaluate-answer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Evaluation failed' }));
    throw new Error(err.error || 'Evaluation error');
  }

  return await res.json();
}

export async function generateFinalReportApi(params: {
  jobRole: string;
  interviewType: string;
  experienceLevel: string;
  durationSeconds: number;
  evaluations: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
}): Promise<Omit<FinalInterviewReport, 'id' | 'interviewId' | 'userId' | 'createdAt' | 'answers'>> {
  const res = await fetch(`${API_BASE}/gemini/final-report`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Failed to generate final report');
  }

  return await res.json();
}

export async function uploadResumeApi(file: File): Promise<{
  success: boolean;
  filename: string;
  rawText: string;
  structured: any;
}> {
  const formData = new FormData();
  formData.append('resume', file);

  const runtimeKey = getRuntimeGeminiKey();
  const headers: Record<string, string> = {};
  if (runtimeKey) {
    headers['x-gemini-key'] = runtimeKey;
  }

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Failed to upload and parse resume');
  }

  return await res.json();
}

export async function executeCodeApi(params: {
  language: string;
  code: string;
  stdin?: string;
}): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  output: string;
  executionTime: number;
}> {
  const res = await fetch(`${API_BASE}/execute-code`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Code execution failed' }));
    throw new Error(err.error || 'Code execution failed');
  }

  return await res.json();
}

export async function reviewCodeApi(params: {
  problemTitle: string;
  problemDescription: string;
  language: string;
  code: string;
  executionResult: any;
}): Promise<{
  correctnessScore: number;
  timeComplexity: string;
  spaceComplexity: string;
  feedback: string;
  suggestions: string[];
  improvedCode?: string;
}> {
  const res = await fetch(`${API_BASE}/gemini/review-code`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Code review failed');
  }

  return await res.json();
}


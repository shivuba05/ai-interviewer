export type InterviewType = 'Technical' | 'HR' | 'Coding' | 'Aptitude';

export type ExperienceLevel = 'Fresher' | 'Intermediate' | 'Experienced';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type InterviewLanguage = 'English' | 'Kannada' | 'Hindi';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'student' | 'admin';
  targetRole?: string;
  experienceLevel?: ExperienceLevel;
  preferredLanguage?: InterviewLanguage;
  createdAt: string;
}

export interface InterviewSetupConfig {
  interviewType: InterviewType;
  jobRole: string;
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  questionCount: number;
  language: InterviewLanguage;
  resumeId?: string;
  resumeText?: string;
}

export interface QuestionItem {
  id: string;
  order: number;
  question: string;
  expectedPoints: string[];
  difficulty: DifficultyLevel;
  category: InterviewType;
  isFollowUp?: boolean;
  parentQuestionId?: string;
}

export interface AnswerEvaluation {
  score: number; // 0 to 10
  relevanceScore: number;
  technicalScore: number;
  communicationScore: number;
  clarityScore: number;
  completenessScore: number;
  problemSolvingScore: number;
  positiveFeedback: string;
  areasForImprovement: string;
  suggestedBetterAnswer: string;
}

export interface InterviewAnswerRecord {
  questionId: string;
  questionText: string;
  answerText: string;
  evaluation?: AnswerEvaluation;
  timeSpentSeconds: number;
}

export interface FinalInterviewReport {
  id: string;
  interviewId: string;
  userId: string;
  overallScore: number; // 0 to 100
  jobRole: string;
  interviewType: InterviewType;
  experienceLevel: ExperienceLevel;
  durationSeconds: number;
  createdAt: string;
  strengths: string[];
  weaknesses: string[];
  technicalKnowledgeAssessment: string;
  communicationFeedback: string;
  improvementSuggestions: string[];
  recommendedTopics: string[];
  summary: string;
  answers: InterviewAnswerRecord[];
}

export interface ResumeData {
  id: string;
  userId: string;
  filename: string;
  rawText: string;
  skills: string[];
  technologies: string[];
  experienceSummary: string;
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  suggestedInterviewFocus: string[];
  createdAt: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  category: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    python: string;
    c: string;
    'c++': string;
    java: string;
    javascript: string;
  };
  sampleSolution?: {
    python?: string;
    'c++'?: string;
    java?: string;
  };
}


import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  InterviewSetupConfig,
  QuestionItem,
  InterviewAnswerRecord,
  AnswerEvaluation,
  FinalInterviewReport,
  DifficultyLevel,
} from '../types';
import {
  generateQuestionsApi,
  generateFollowUpApi,
  evaluateAnswerApi,
  generateFinalReportApi,
} from '../lib/api';
import {
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
  SpeechRecognizerInstance,
  isSpeechRecognitionSupported,
  createAudioLevelMeter,
  AudioLevelMeter,
} from '../lib/speech';
import { localDb, isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export type InterviewStatus = 'idle' | 'configuring' | 'interviewing' | 'paused' | 'evaluating' | 'completed';

interface InterviewContextType {
  status: InterviewStatus;
  setup: InterviewSetupConfig | null;
  questions: QuestionItem[];
  currentIndex: number;
  currentQuestion: QuestionItem | null;
  answers: InterviewAnswerRecord[];
  latestEvaluation: AnswerEvaluation | null;
  finalReport: FinalInterviewReport | null;
  durationSeconds: number;
  isWebcamActive: boolean;
  isMicActive: boolean;
  isAiSpeaking: boolean;
  isGeneratingQuestions: boolean;
  isEvaluatingAnswer: boolean;
  audioLevel: number;
  hasSavedSession: boolean;
  errorMessage: string | null;
  interimTranscript: string;
  accumulatedAnswer: string;
  setAccumulatedAnswer: (text: string) => void;
  // Actions
  startInterview: (config: InterviewSetupConfig) => Promise<void>;
  resumeSavedSession: () => void;
  clearSavedSession: () => void;
  submitAnswer: (answerText: string) => Promise<AnswerEvaluation | null>;
  nextQuestion: () => void;
  pauseInterview: () => void;
  resumeInterview: () => void;
  endInterview: () => Promise<void>;
  toggleWebcam: () => void;
  toggleMic: () => void;
  speakCurrentQuestion: () => void;
  stopAiSpeaking: () => void;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [setup, setSetup] = useState<InterviewSetupConfig | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswerRecord[]>([]);
  const [latestEvaluation, setLatestEvaluation] = useState<AnswerEvaluation | null>(null);
  const [finalReport, setFinalReport] = useState<FinalInterviewReport | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Device & AI Voice States
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Speech Recognition Buffers
  const [accumulatedAnswer, setAccumulatedAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const speechRecognizerRef = useRef<SpeechRecognizerInstance | null>(null);
  const audioMeterRef = useRef<AudioLevelMeter | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_interview_saved_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.questions && parsed.questions.length > 0) {
          setHasSavedSession(true);
        }
      }
    } catch (e) {}
  }, []);

  // Autosave active interview session
  useEffect(() => {
    if (status === 'interviewing' && questions.length > 0) {
      try {
        const sessionData = {
          setup,
          questions,
          currentIndex,
          answers,
          durationSeconds,
          timestamp: Date.now(),
        };
        localStorage.setItem('ai_interview_saved_session', JSON.stringify(sessionData));
        setHasSavedSession(true);
      } catch (e) {}
    }
  }, [status, questions, currentIndex, answers, durationSeconds, setup]);

  const clearSavedSession = () => {
    localStorage.removeItem('ai_interview_saved_session');
    setHasSavedSession(false);
  };

  const resumeSavedSession = () => {
    try {
      const saved = localStorage.getItem('ai_interview_saved_session');
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.questions && data.questions.length > 0) {
        setSetup(data.setup);
        setQuestions(data.questions);
        setCurrentIndex(data.currentIndex || 0);
        setAnswers(data.answers || []);
        setDurationSeconds(data.durationSeconds || 0);
        setStatus('interviewing');
        questionStartTimeRef.current = Date.now();
      }
    } catch (e) {
      console.warn('Failed to resume saved session:', e);
    }
  };

  // Current Question
  const currentQuestion = questions[currentIndex] || null;

  // Timer Tick
  useEffect(() => {
    if (status === 'interviewing') {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      if (audioMeterRef.current) {
        audioMeterRef.current.stop();
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const speakCurrentQuestion = () => {
    if (!currentQuestion) return;
    setIsAiSpeaking(true);
    speakText(
      currentQuestion.question,
      setup?.language || 'English',
      {
        onStart: () => setIsAiSpeaking(true),
        onEnd: () => setIsAiSpeaking(false),
        onError: () => setIsAiSpeaking(false),
      }
    );
  };

  const stopAiSpeaking = () => {
    stopSpeaking();
    setIsAiSpeaking(false);
  };

  const toggleWebcam = () => {
    setIsWebcamActive((prev) => !prev);
  };

  const toggleMic = () => {
    if (isMicActive) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      if (audioMeterRef.current) {
        audioMeterRef.current.stop();
        audioMeterRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      setAudioLevel(0);
      setIsMicActive(false);
      setInterimTranscript('');
    } else {
      if (!isSpeechRecognitionSupported()) {
        setErrorMessage('Web Speech Recognition is not supported by your browser. You can type your answer in the box.');
        return;
      }

      // Initialize real audio analyser for live audio waveform
      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => {
          micStreamRef.current = stream;
          audioMeterRef.current = createAudioLevelMeter(stream, (lvl) => {
            setAudioLevel(lvl);
          });
        })
        .catch((e) => {
          console.warn('Audio level meter stream could not be opened:', e);
        });

      const recognizer = createSpeechRecognizer(setup?.language || 'English', {
        onStart: () => setIsMicActive(true),
        onTranscript: (final, interim) => {
          setInterimTranscript(interim);
          setAccumulatedAnswer((prev) => {
            // Append final
            if (final) {
              const base = prev.trim();
              return base ? `${base} ${final}` : final;
            }
            return prev;
          });
        },
        onError: (err) => {
          setErrorMessage(err);
          setIsMicActive(false);
          setAudioLevel(0);
        },
        onEnd: () => {
          setIsMicActive(false);
          setAudioLevel(0);
          setInterimTranscript('');
        },
      });

      speechRecognizerRef.current = recognizer;
      if (recognizer) {
        recognizer.start();
        setIsMicActive(true);
      }
    }
  };

  // Start Interview
  const startInterview = async (config: InterviewSetupConfig) => {
    try {
      setErrorMessage(null);
      setIsGeneratingQuestions(true);
      setSetup(config);
      setDurationSeconds(0);
      setAnswers([]);
      setLatestEvaluation(null);
      setFinalReport(null);
      setCurrentIndex(0);
      setAccumulatedAnswer('');
      setInterimTranscript('');

      const { questions: generated } = await generateQuestionsApi(config);

      if (!generated || generated.length === 0) {
        throw new Error('No interview questions could be generated. Please try again.');
      }

      setQuestions(generated);
      setStatus('interviewing');
      setIsGeneratingQuestions(false);
      questionStartTimeRef.current = Date.now();

      // Read out first question automatically
      setTimeout(() => {
        if (generated[0]) {
          setIsAiSpeaking(true);
          speakText(generated[0].question, config.language, {
            onStart: () => setIsAiSpeaking(true),
            onEnd: () => setIsAiSpeaking(false),
          });
        }
      }, 600);
    } catch (err: any) {
      setIsGeneratingQuestions(false);
      setErrorMessage(err.message || 'Failed to initialize interview.');
      setStatus('idle');
    }
  };

  // Submit Answer
  const submitAnswer = async (answerText: string): Promise<AnswerEvaluation | null> => {
    if (!currentQuestion) return null;

    stopAiSpeaking();
    if (isMicActive && speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
      setIsMicActive(false);
    }

    try {
      setIsEvaluatingAnswer(true);
      setErrorMessage(null);

      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));

      const evaluation = await evaluateAnswerApi({
        jobRole: setup?.jobRole || 'Software Developer',
        question: currentQuestion.question,
        expectedPoints: currentQuestion.expectedPoints,
        candidateAnswer: answerText,
        language: setup?.language || 'English',
        difficulty: currentQuestion.difficulty,
      });

      const newRecord: InterviewAnswerRecord = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        answerText,
        evaluation,
        timeSpentSeconds: timeSpent,
      };

      setAnswers((prev) => [...prev, newRecord]);
      setLatestEvaluation(evaluation);
      setIsEvaluatingAnswer(false);

      // Check if we should insert an adaptive follow-up question
      // If score is very high (> 8.5) or question count allows it and not already a follow-up
      if (!currentQuestion.isFollowUp && currentIndex < questions.length - 1 && Math.random() > 0.4) {
        try {
          const followUpData = await generateFollowUpApi({
            jobRole: setup?.jobRole || 'Software Developer',
            question: currentQuestion.question,
            candidateAnswer: answerText,
            language: setup?.language || 'English',
            currentDifficulty: currentQuestion.difficulty,
          });

          if (followUpData?.followUp) {
            const followUpItem: QuestionItem = {
              id: `q-followup-${Date.now()}`,
              order: currentQuestion.order + 1,
              question: followUpData.followUp,
              expectedPoints: ['Deeper technical elaboration', 'Real-world edge cases handling'],
              difficulty: (followUpData.adjustedDifficulty as DifficultyLevel) || currentQuestion.difficulty,
              category: currentQuestion.category,
              isFollowUp: true,
              parentQuestionId: currentQuestion.id,
            };

            // Insert directly after current question
            setQuestions((prev) => {
              const copy = [...prev];
              copy.splice(currentIndex + 1, 0, followUpItem);
              return copy;
            });
          }
        } catch (e) {
          console.warn('Adaptive follow-up generation skipped:', e);
        }
      }

      return evaluation;
    } catch (err: any) {
      setIsEvaluatingAnswer(false);
      setErrorMessage(err.message || 'Evaluation failed. You can proceed to next question.');
      return null;
    }
  };

  // Next Question
  const nextQuestion = () => {
    setLatestEvaluation(null);
    setAccumulatedAnswer('');
    setInterimTranscript('');

    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      questionStartTimeRef.current = Date.now();

      // Read aloud next question
      setTimeout(() => {
        if (questions[nextIdx]) {
          setIsAiSpeaking(true);
          speakText(questions[nextIdx].question, setup?.language || 'English', {
            onStart: () => setIsAiSpeaking(true),
            onEnd: () => setIsAiSpeaking(false),
          });
        }
      }, 400);
    } else {
      // Completed all questions
      endInterview();
    }
  };

  const pauseInterview = () => {
    stopAiSpeaking();
    if (isMicActive && speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
      setIsMicActive(false);
    }
    setStatus('paused');
  };

  const resumeInterview = () => {
    setStatus('interviewing');
    questionStartTimeRef.current = Date.now();
  };

  // End Interview & Generate Final Report
  const endInterview = async () => {
    stopAiSpeaking();
    if (isMicActive && speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
      setIsMicActive(false);
    }

    setStatus('evaluating');

    try {
      // Check if candidate answered NO questions (or all answers were blank/skipped)
      const validAnswers = answers.filter(
        (a) => a.answerText && a.answerText.trim().length > 0 && a.evaluation && a.evaluation.score > 0
      );

      // If no questions were answered at all, score is strictly 0
      if (answers.length === 0 || validAnswers.length === 0) {
        const zeroReport: FinalInterviewReport = {
          id: `rep-${Date.now()}`,
          interviewId: `int-${Date.now()}`,
          userId: user?.id || 'usr-demo-001',
          overallScore: 0,
          jobRole: setup?.jobRole || 'Software Developer',
          interviewType: setup?.interviewType || 'Technical',
          experienceLevel: setup?.experienceLevel || 'Fresher',
          durationSeconds,
          createdAt: new Date().toISOString(),
          strengths: ['Interview session initiated'],
          weaknesses: ['No questions were answered during this session'],
          technicalKnowledgeAssessment: 'No answers were submitted to evaluate technical proficiency.',
          communicationFeedback: 'No verbal or written candidate answers were recorded.',
          improvementSuggestions: [
            'Attempt answering questions to receive a comprehensive diagnostic evaluation.',
            'Review foundational concepts for this role and try again.',
          ],
          recommendedTopics: ['Job Role Fundamentals', 'Interview Practice Basics'],
          summary: 'The interview was concluded without submitting any answers. Overall Score: 0 / 100.',
          answers,
        };

        localDb.saveReport(zeroReport);
        setFinalReport(zeroReport);
        setStatus('completed');
        return;
      }

      // Gather evaluation list
      const evaluationPayload = answers.map((a) => ({
        question: a.questionText,
        answer: a.answerText,
        score: a.evaluation?.score ?? 0,
        feedback: a.evaluation?.positiveFeedback ?? 'No answer provided',
      }));

      const reportData = await generateFinalReportApi({
        jobRole: setup?.jobRole || 'Software Developer',
        interviewType: setup?.interviewType || 'Technical',
        experienceLevel: setup?.experienceLevel || 'Fresher',
        durationSeconds,
        evaluations: evaluationPayload,
      });

      // Calculate fair overall score based on total questions
      const totalQuestionCount = questions.length > 0 ? questions.length : answers.length;
      const totalScoreSum = answers.reduce((sum, a) => sum + (a.evaluation?.score ?? 0), 0);
      const computedScore = Math.round((totalScoreSum / totalQuestionCount) * 10 * 10) / 10;
      const finalOverallScore = computedScore === 0 ? 0 : (reportData.overallScore || computedScore);

      const fullReport: FinalInterviewReport = {
        id: `rep-${Date.now()}`,
        interviewId: `int-${Date.now()}`,
        userId: user?.id || 'usr-demo-001',
        overallScore: finalOverallScore,
        jobRole: setup?.jobRole || 'Software Developer',
        interviewType: setup?.interviewType || 'Technical',
        experienceLevel: setup?.experienceLevel || 'Fresher',
        durationSeconds,
        createdAt: new Date().toISOString(),
        strengths: finalOverallScore > 0 ? (reportData.strengths || []) : ['Interview session initiated'],
        weaknesses: reportData.weaknesses || ['Provide more detailed explanations across all questions'],
        technicalKnowledgeAssessment: reportData.technicalKnowledgeAssessment || '',
        communicationFeedback: reportData.communicationFeedback || '',
        improvementSuggestions: reportData.improvementSuggestions || [],
        recommendedTopics: reportData.recommendedTopics || [],
        summary: reportData.summary || `Candidate completed the interview with a final score of ${finalOverallScore} / 100.`,
        answers,
      };

      // Persist to Supabase if available
      if (isSupabaseConfigured && supabase && user) {
        try {
          await supabase.from('interviews').insert({
            id: fullReport.interviewId,
            user_id: user.id,
            interview_type: fullReport.interviewType,
            job_role: fullReport.jobRole,
            experience_level: fullReport.experienceLevel,
            difficulty: setup?.difficulty || 'Medium',
            language: setup?.language || 'English',
            question_count: questions.length,
            status: 'completed',
            overall_score: fullReport.overallScore,
            duration_seconds: fullReport.durationSeconds,
            completed_at: new Date().toISOString(),
          });

          await supabase.from('interview_reports').insert({
            id: fullReport.id,
            interview_id: fullReport.interviewId,
            user_id: user.id,
            overall_score: fullReport.overallScore,
            strengths: fullReport.strengths,
            weaknesses: fullReport.weaknesses,
            technical_knowledge_assessment: fullReport.technicalKnowledgeAssessment,
            communication_feedback: fullReport.communicationFeedback,
            improvement_suggestions: fullReport.improvementSuggestions,
            recommended_topics: fullReport.recommendedTopics,
            summary: fullReport.summary,
          });
        } catch (dbErr) {
          console.warn('Failed saving to Supabase, saved to localDb instead:', dbErr);
        }
      }

      // Always save to localDb for redundancy & offline resilience
      localDb.saveReport(fullReport);
      clearSavedSession();

      setFinalReport(fullReport);
      setStatus('completed');

      // Celebration Confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#06b6d4', '#10b981', '#8b5cf6'],
        });
      } catch (c) {}
    } catch (err: any) {
      console.error('Final report generation error:', err);
      setErrorMessage('Could not generate AI report: ' + err.message);
      setStatus('completed');
    }
  };

  const resetInterview = () => {
    stopAiSpeaking();
    if (speechRecognizerRef.current) speechRecognizerRef.current.abort();
    if (audioMeterRef.current) audioMeterRef.current.stop();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    setAudioLevel(0);
    clearSavedSession();
    setStatus('idle');
    setSetup(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setLatestEvaluation(null);
    setFinalReport(null);
    setDurationSeconds(0);
    setAccumulatedAnswer('');
    setInterimTranscript('');
    setErrorMessage(null);
  };

  return (
    <InterviewContext.Provider
      value={{
        status,
        setup,
        questions,
        currentIndex,
        currentQuestion,
        answers,
        latestEvaluation,
        finalReport,
        durationSeconds,
        isWebcamActive,
        isMicActive,
        isAiSpeaking,
        isGeneratingQuestions,
        isEvaluatingAnswer,
        audioLevel,
        hasSavedSession,
        errorMessage,
        interimTranscript,
        accumulatedAnswer,
        setAccumulatedAnswer,
        startInterview,
        resumeSavedSession,
        clearSavedSession,
        submitAnswer,
        nextQuestion,
        pauseInterview,
        resumeInterview,
        endInterview,
        toggleWebcam,
        toggleMic,
        speakCurrentQuestion,
        stopAiSpeaking,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) throw new Error('useInterview must be used within an InterviewProvider');
  return context;
};


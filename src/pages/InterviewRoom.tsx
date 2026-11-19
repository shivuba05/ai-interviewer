import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Send,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  HelpCircle,
  Eye,
  Bot,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { AnswerEvaluation } from '../types';

interface InterviewRoomProps {
  onComplete: () => void;
  onExit: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ onComplete, onExit }) => {
  const {
    status,
    setup,
    questions,
    currentIndex,
    currentQuestion,
    durationSeconds,
    isWebcamActive,
    isMicActive,
    isAiSpeaking,
    isEvaluatingAnswer,
    latestEvaluation,
    audioLevel,
    hasSavedSession,
    resumeSavedSession,
    clearSavedSession,
    interimTranscript,
    accumulatedAnswer,
    setAccumulatedAnswer,
    submitAnswer,
    nextQuestion,
    pauseInterview,
    resumeInterview,
    endInterview,
    toggleWebcam,
    toggleMic,
    speakCurrentQuestion,
    stopAiSpeaking,
  } = useInterview();

  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Synchronize typed answer with accumulated voice answer
  useEffect(() => {
    if (accumulatedAnswer) {
      setTypedAnswer(accumulatedAnswer);
    }
  }, [accumulatedAnswer]);

  // When an evaluation is received, pop open the instant feedback modal
  useEffect(() => {
    if (latestEvaluation) {
      setShowEvaluationModal(true);
    }
  }, [latestEvaluation]);

  // Real webcam handling
  useEffect(() => {
    if (isWebcamActive) {
      setWebcamError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Webcam permission error:', err);
          setWebcamError('Camera access not granted or unavailable.');
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isWebcamActive]);

  // Format Duration mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSendAnswer = async () => {
    const finalAnswer = (typedAnswer.trim() || accumulatedAnswer.trim() || interimTranscript.trim());
    if (!finalAnswer) {
      if (window.confirm("You have not entered an answer for this question. Submit as unanswered (0 marks)?")) {
        await submitAnswer('Unanswered');
      }
      return;
    }

    await submitAnswer(finalAnswer);
  };

  const handleSkipQuestion = async () => {
    await submitAnswer('Skipped (No answer provided)');
  };

  const handleNext = () => {
    setShowEvaluationModal(false);
    setTypedAnswer('');
    nextQuestion();
  };

  const handleEndEarly = async () => {
    if (window.confirm('Are you sure you want to conclude the interview and generate your performance report now?')) {
      await endInterview();
      onComplete();
    }
  };

  // If status is completed
  if (status === 'completed') {
    onComplete();
    return null;
  }

  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 animate-fade-in relative">
      {/* Resume Session Banner if Available */}
      {hasSavedSession && status === 'idle' && (
        <div className="mb-4 bg-brand-950/60 border border-brand-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 animate-spin-reverse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Unfinished Interview Session Detected</p>
              <p className="text-xs text-slate-300">You have an in-progress interview saved on this device. Would you like to resume?</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearSavedSession}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Discard
            </button>
            <button
              onClick={resumeSavedSession}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow transition flex items-center space-x-1.5"
            >
              <span>Resume Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        {/* Left: Role and Progress */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm sm:text-base">{setup?.jobRole}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {setup?.interviewType}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                currentQuestion?.difficulty === 'Hard'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : currentQuestion?.difficulty === 'Medium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentQuestion?.difficulty || 'Medium'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Language: <span className="text-slate-300 font-medium">{setup?.language}</span> • Level: <span className="text-slate-300 font-medium">{setup?.experienceLevel}</span>
            </p>
          </div>
        </div>

        {/* Center: Question Indicator & Progress */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            {currentQuestion?.isFollowUp && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] animate-pulse">
                Adaptive Follow-up
              </span>
            )}
          </div>
          <div className="w-36 sm:w-48 h-2 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Timer & Session Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono text-cyan-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm">{formatTime(durationSeconds)}</span>
          </div>

          {status === 'interviewing' ? (
            <button
              onClick={pauseInterview}
              className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition"
              title="Pause Interview"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={resumeInterview}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow transition"
              title="Resume Interview"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={handleEndEarly}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold transition flex items-center space-x-1.5"
            title="End Interview & Generate Report"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">End Interview</span>
          </button>
        </div>
      </div>

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 flex-grow">
        {/* Left Column: AI Interviewer Presence & Question */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle AI Aura */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* AI Avatar State */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 shadow-xl ${
                    isAiSpeaking ? 'ring-4 ring-cyan-500/40 animate-pulse' : ''
                  }`}>
                    <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                      <Bot className="w-7 h-7 text-cyan-300" />
                    </div>
                  </div>
                  {isAiSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">Gemini Senior Interviewer</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isEvaluatingAnswer
                        ? 'bg-purple-400 animate-pulse'
                        : isAiSpeaking
                        ? 'bg-cyan-400 animate-pulse'
                        : isMicActive
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-400'
                    }`} />
                    <span className="text-xs text-slate-400">
                      {isEvaluatingAnswer
                        ? 'Evaluating candidate response...'
                        : isAiSpeaking
                        ? 'Speaking question aloud...'
                        : isMicActive
                        ? 'Listening to candidate...'
                        : 'Awaiting your answer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* TTS Audio Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={isAiSpeaking ? stopAiSpeaking : speakCurrentQuestion}
                  className={`p-2.5 rounded-xl border transition ${
                    isAiSpeaking
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                      : 'bg-navy-850 border-navy-700 text-slate-300 hover:text-white hover:bg-navy-800'
                  }`}
                  title={isAiSpeaking ? 'Stop AI Voice' : 'Read Question Aloud'}
                >
                  {isAiSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Current Question Text Card */}
            <div className="p-6 rounded-2xl bg-navy-950/90 border border-navy-800/90 shadow-inner space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-brand-400 uppercase tracking-wider">
                  Question #{currentIndex + 1}
                </span>
                <span className="px-2 py-0.5 rounded bg-navy-850 text-slate-300 border border-navy-700">
                  {currentQuestion?.category || setup?.interviewType}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed">
                {currentQuestion?.question}
              </h2>

              {currentQuestion?.expectedPoints && currentQuestion.expectedPoints.length > 0 && (
                <div className="pt-4 border-t border-navy-900 text-xs text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Focus Areas to Address:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                    {currentQuestion.expectedPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sound Wave Animation if Speaking or Listening */}
          <div className="mt-6 flex flex-col items-center justify-center space-y-1.5 min-h-[40px]">
            {(isAiSpeaking || isMicActive) ? (
              <div className="flex items-center space-x-1.5 h-8">
                {[6, 12, 20, 28, 16, 32, 22, 14, 26, 18, 10, 6].map((baseH, i) => {
                  const factor = isMicActive
                    ? Math.max(0.2, (audioLevel / 100) * 1.8 + 0.3)
                    : 1;
                  const dynamicHeight = Math.min(32, Math.max(4, baseH * factor));
                  return (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-100 ${
                        isAiSpeaking ? 'bg-cyan-400' : 'bg-emerald-400'
                      }`}
                      style={{
                        height: `${dynamicHeight}px`,
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-600" />
                <span>Microphone ready • Speak or type below</span>
              </span>
            )}
            {isMicActive && (
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
                Live Mic Level: {Math.round(audioLevel)}%
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Interaction (Webcam Preview & Voice/Text Answer) */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6">
          {/* Webcam Preview Strip */}
          <div className="relative rounded-2xl overflow-hidden bg-navy-950 border border-navy-800 aspect-video max-h-48 sm:max-h-56 flex items-center justify-center shadow-inner">
            {isWebcamActive && !webcamError ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="text-center p-4 text-slate-500 space-y-2">
                <VideoOff className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-xs">
                  {webcamError || 'Camera preview is off. Click below to toggle live camera feed.'}
                </p>
              </div>
            )}

            {/* Webcam Live Status Badge */}
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2 py-1 rounded-md bg-navy-950/80 backdrop-blur-md border border-navy-800 text-[10px] text-slate-300 font-mono">
              <span className={`w-2 h-2 rounded-full ${isWebcamActive && !webcamError ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isWebcamActive && !webcamError ? 'LIVE CAM PREVIEW' : 'CAM DISABLED'}</span>
            </div>

            {/* In-Preview Hardware Controls */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                onClick={toggleWebcam}
                className={`p-2 rounded-lg text-xs font-semibold transition backdrop-blur-md border ${
                  isWebcamActive
                    ? 'bg-navy-900/90 text-white border-navy-700 hover:bg-navy-800'
                    : 'bg-brand-600/90 text-white border-brand-500 hover:bg-brand-500'
                }`}
                title="Toggle Camera Preview"
              >
                {isWebcamActive ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-slate-300" />}
              </button>
            </div>
          </div>

          {/* Answer Input Area: Voice vs Text */}
          <div className="space-y-3 flex-grow flex flex-col justify-end">
            {/* Input Mode Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInputMode('voice')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    inputMode === 'voice'
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Answer</span>
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                    inputMode === 'text'
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Text Mode</span>
                </button>
              </div>

              {inputMode === 'voice' && (
                <span className="text-[11px] text-slate-400">
                  {isMicActive ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <span>Recording speech...</span>
                    </span>
                  ) : (
                    'Click mic to start answering'
                  )}
                </span>
              )}
            </div>

            {/* Input Box / Speech Transcript Box */}
            <div className="relative">
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder={
                  inputMode === 'voice'
                    ? isMicActive
                      ? 'Listening... speak clearly into your microphone...'
                      : 'Click the Microphone button below to speak your response, or type directly here...'
                    : 'Type your detailed answer here...'
                }
                rows={4}
                className="w-full p-4 bg-navy-950 border border-navy-700/80 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 leading-relaxed resize-none shadow-inner"
              />

              {/* Interim voice ghost text preview */}
              {interimTranscript && (
                <div className="absolute bottom-4 left-4 right-4 text-xs text-cyan-300 italic pointer-events-none truncate bg-navy-950/90 py-1 px-2 rounded">
                  {interimTranscript}...
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMic}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center space-x-2 shadow-lg ${
                    isMicActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isMicActive ? 'Stop Recording' : 'Start Speaking'}</span>
                </button>

                {typedAnswer && (
                  <button
                    onClick={() => {
                      setTypedAnswer('');
                      setAccumulatedAnswer('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition px-2"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  disabled={isEvaluatingAnswer}
                  className="px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white font-semibold text-xs transition border border-navy-700/80"
                  title="Skip this question with 0 marks"
                >
                  Skip Question (0 marks)
                </button>

                <button
                  onClick={handleSendAnswer}
                  disabled={isEvaluatingAnswer}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-500/25 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isEvaluatingAnswer ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gemini Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant AI Answer Evaluation Modal */}
      {showEvaluationModal && latestEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-navy-900 border border-brand-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-navy-850/80 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Instant AI Evaluation</h3>
                  <p className="text-xs text-slate-400">Question #{currentIndex + 1} Assessment</p>
                </div>
              </div>

              {/* Score pill */}
              <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 font-extrabold text-sm">
                <span>Score:</span>
                <span className="text-white text-base">{latestEvaluation.score}</span>
                <span className="text-slate-400 text-xs">/ 10</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* 6-Factor Metric Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Relevance', score: latestEvaluation.relevanceScore },
                  { label: 'Technical Accuracy', score: latestEvaluation.technicalScore },
                  { label: 'Communication', score: latestEvaluation.communicationScore },
                  { label: 'Clarity', score: latestEvaluation.clarityScore },
                  { label: 'Completeness', score: latestEvaluation.completenessScore },
                  { label: 'Problem Solving', score: latestEvaluation.problemSolvingScore },
                ].map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-navy-950 border border-navy-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-bold text-white">{m.score}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                        style={{ width: `${(m.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Positive Feedback */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <p className="font-bold text-emerald-300 text-xs flex items-center space-x-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Strengths in Your Response</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {latestEvaluation.positiveFeedback}
                </p>
              </div>

              {/* Areas for Improvement */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                <p className="font-bold text-amber-300 text-xs flex items-center space-x-1.5 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Areas for Improvement</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {latestEvaluation.areasForImprovement}
                </p>
              </div>

              {/* Model / Suggested Better Answer */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5">
                <p className="font-bold text-cyan-300 text-xs flex items-center space-x-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Suggested Exemplary Answer</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{latestEvaluation.suggestedBetterAnswer}"
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-navy-850/80 border-t border-navy-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {currentIndex + 1 < questions.length
                  ? `Next up: Question ${currentIndex + 2}`
                  : 'Ready to finalize interview report'}
              </span>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-brand-500/20 transition flex items-center space-x-2"
              >
                <span>
                  {currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Interview & View Report'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


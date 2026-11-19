import React, { useState } from 'react';
import {
  Play,
  Cpu,
  Users,
  Code2,
  Compass,
  Briefcase,
  Layers,
  Gauge,
  HelpCircle,
  Languages,
  FileText,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import {
  InterviewType,
  ExperienceLevel,
  DifficultyLevel,
  InterviewLanguage,
  InterviewSetupConfig,
  ResumeData,
} from '../types';
import { localDb } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface InterviewSetupPageProps {
  initialCategory?: InterviewType;
  onLaunchInterview: (config: InterviewSetupConfig) => void;
  onNavigate: (view: string) => void;
}

export const InterviewSetupPage: React.FC<InterviewSetupPageProps> = ({
  initialCategory = 'Technical',
  onLaunchInterview,
  onNavigate,
}) => {
  const { user } = useAuth();

  const [interviewType, setInterviewType] = useState<InterviewType>(initialCategory);
  const [jobRole, setJobRole] = useState(user?.targetRole || 'Software Developer');
  const [customRole, setCustomRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    user?.experienceLevel || 'Fresher'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState<InterviewLanguage>(
    user?.preferredLanguage || 'English'
  );
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');

  const resumes: ResumeData[] = localDb.getResumes(user?.id);
  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const standardRoles = [
    'Software Developer',
    'Web Developer',
    'Python Developer',
    'Data Analyst',
    'Full Stack Engineer',
    'DevOps / Cloud Engineer',
    'Machine Learning Engineer',
  ];

  const handleStart = () => {
    const finalRole = customRole.trim() ? customRole.trim() : jobRole;
    const config: InterviewSetupConfig = {
      interviewType,
      jobRole: finalRole,
      experienceLevel,
      difficulty,
      questionCount,
      language,
      resumeId: selectedResumeId || undefined,
      resumeText: activeResume ? activeResume.rawText : undefined,
    };
    onLaunchInterview(config);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intelligent Setup Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Configure Your Practice Interview
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Customize your role, level, question volume, and language. Gemini AI will generate tailored questions in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Options Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Interview Type */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>1. Select Interview Track</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Technical' as InterviewType, icon: Cpu, label: 'Technical', desc: 'System design, APIs, fundamentals' },
                { type: 'HR' as InterviewType, icon: Users, label: 'HR / Behavioral', desc: 'STAR method, culture, teamwork' },
                { type: 'Coding' as InterviewType, icon: Code2, label: 'Coding', desc: 'Algorithms, data structures & logic' },
                { type: 'Aptitude' as InterviewType, icon: Compass, label: 'Aptitude', desc: 'Quant, analytical & speed math' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = interviewType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setInterviewType(item.type)}
                    className={`p-4 rounded-xl text-left border transition relative ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/15'
                        : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                    <p className="font-bold text-sm text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Job Role */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>2. Select Job Role</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {standardRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setJobRole(role);
                    setCustomRole('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    jobRole === role && !customRole
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                      : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white hover:border-navy-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <input
                type="text"
                placeholder="Or type a custom role (e.g. iOS Developer, Blockchain Engineer)..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 3. Experience & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Experience Level */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                <Users className="w-4 h-4 text-purple-400" />
                <span>3. Experience Level</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Fresher', 'Intermediate', 'Experienced'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                      experienceLevel === lvl
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>4. Difficulty</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                      difficulty === diff
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Number of Questions & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Questions Count */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>5. Number of Questions</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                      questionCount === count
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                <Languages className="w-4 h-4 text-pink-400" />
                <span>6. Interview Language</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['English', 'Kannada', 'Hindi'] as InterviewLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                      language === lang
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Resume Personalization Link */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-bold text-white uppercase tracking-wider">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Resume Deep-Dive (Optional)</span>
              </label>
              <button
                onClick={() => onNavigate('resume')}
                className="text-xs text-brand-400 hover:underline"
              >
                + Upload New Resume
              </button>
            </div>

            {resumes.length > 0 ? (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">No Resume (Standard Role Scenario)</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    📄 {r.filename} ({r.skills.slice(0, 3).join(', ')}...)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400">
                No resumes uploaded yet.{' '}
                <button
                  onClick={() => onNavigate('resume')}
                  className="text-brand-400 font-semibold hover:underline"
                >
                  Upload your PDF resume
                </button>{' '}
                to get questions tailored to your actual listed projects and technologies.
              </p>
            )}
          </div>
        </div>

        {/* Live Configuration Summary Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-navy-900 to-navy-950 border border-brand-500/30 shadow-2xl sticky top-24 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-navy-800">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">Interview Summary</h3>
                <p className="text-xs text-slate-400">Ready to launch simulation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Track:</span>
                <span className="font-bold text-brand-300">{interviewType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Role:</span>
                <span className="font-bold text-white">{customRole.trim() || jobRole}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Experience:</span>
                <span className="font-bold text-purple-300">{experienceLevel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Difficulty:</span>
                <span className="font-bold text-amber-300">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-emerald-300">{questionCount} Questions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Language:</span>
                <span className="font-bold text-pink-300">{language}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-navy-850">
                <span className="text-slate-400">Resume Context:</span>
                <span className="font-bold text-slate-300">
                  {activeResume ? activeResume.filename : 'Generic Role Bank'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition transform hover:scale-102 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter AI Interview Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Upon entering, the AI interviewer will vocalize the first question. Have your microphone ready or toggle text input.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


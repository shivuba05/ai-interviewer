import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Code2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { ResumeData, InterviewSetupConfig } from '../types';
import { uploadResumeApi } from '../lib/api';
import { localDb } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ResumeInterviewPageProps {
  onStartResumeInterview: (resume: ResumeData) => void;
  onNavigate: (view: string) => void;
}

export const ResumeInterviewPage: React.FC<ResumeInterviewPageProps> = ({
  onStartResumeInterview,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const list = localDb.getResumes(user?.id);
    setResumes(list);
    if (list.length > 0 && !selectedResume) {
      setSelectedResume(list[0]);
    }
  }, [user]);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('Please select a valid PDF file (.pdf).');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await uploadResumeApi(file);
      const newResume: ResumeData = {
        id: `res-${Date.now()}`,
        userId: user?.id || 'usr-demo-001',
        filename: res.filename || file.name,
        rawText: res.rawText || '',
        skills: res.structured?.skills || ['JavaScript', 'Python', 'React'],
        technologies: res.structured?.technologies || ['React', 'Node.js', 'SQL'],
        experienceSummary: res.structured?.experienceSummary || 'Candidate resume parsed successfully.',
        projects: res.structured?.projects || [],
        education: res.structured?.education || [],
        suggestedInterviewFocus: res.structured?.suggestedInterviewFocus || [
          'Practical project engineering challenges',
          'Architecture trade-offs and tech stack decisions',
        ],
        createdAt: new Date().toISOString(),
      };

      localDb.saveResume(newResume);
      setResumes((prev) => [newResume, ...prev]);
      setSelectedResume(newResume);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse resume PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = (id: string) => {
    localDb.deleteResume(id);
    const updated = resumes.filter((r) => r.id !== id);
    setResumes(updated);
    if (selectedResume?.id === id) {
      setSelectedResume(updated[0] || null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intelligent Resume Question Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Resume-Based AI Interview
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Upload your resume to experience authentic recruiter questioning targeted at your specific projects, tech stack, and background.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition text-center flex flex-col items-center justify-center space-y-4 ${
          isDragOver
            ? 'border-brand-400 bg-brand-500/10'
            : 'border-navy-700 bg-navy-900/60 hover:border-brand-500/50 hover:bg-navy-900'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          {isUploading ? (
            <div className="w-8 h-8 border-3 border-brand-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {isUploading ? 'Extracting Resume Data with Gemini...' : 'Upload your PDF Resume'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Drag and drop your PDF here, or browse files. We parse skills, projects, and past experience to create personalized interview tracks.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <label className="cursor-pointer px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition">
          <span>Choose PDF File</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Main Split: Saved Resumes list vs Selected Resume Breakdown */}
      {resumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          {/* Saved Resumes List (4 cols) */}
          <div className="lg:col-span-4 bg-navy-900/80 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Saved Resumes ({resumes.length})
            </h3>

            <div className="space-y-2">
              {resumes.map((r) => {
                const isSelected = selectedResume?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(r)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-white'
                        : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <p className="font-semibold text-xs truncate">{r.filename}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(r.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Resume Details (8 cols) */}
          {selectedResume && (
            <div className="lg:col-span-8 bg-navy-900/80 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header with Start Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedResume.filename}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Parsed & Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedResume.experienceSummary}
                  </p>
                </div>

                <button
                  onClick={() => onStartResumeInterview(selectedResume)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-500/25 transition flex items-center space-x-2 flex-shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Interview With This Resume</span>
                </button>
              </div>

              {/* Skills & Technologies */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Extracted Skills & Tech Stack</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[...(selectedResume.skills || []), ...(selectedResume.technologies || [])]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-700/80 text-xs font-semibold text-brand-300"
                      >
                        {tech}
                      </span>
                    ))}
                </div>
              </div>

              {/* Extracted Projects */}
              {selectedResume.projects && selectedResume.projects.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span>Identified Projects</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedResume.projects.map((proj, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                        <p className="font-bold text-white text-xs">{proj.title}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Interview Focus Areas */}
              {selectedResume.suggestedInterviewFocus && selectedResume.suggestedInterviewFocus.length > 0 && (
                <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Interviewer Target Probes</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {selectedResume.suggestedInterviewFocus.map((foc, i) => (
                      <li key={i}>{foc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


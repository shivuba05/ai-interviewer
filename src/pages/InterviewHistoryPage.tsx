import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  Search,
  Filter,
  FileText,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { FinalInterviewReport, InterviewType } from '../types';
import { localDb } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface InterviewHistoryPageProps {
  onViewReport: (report: FinalInterviewReport) => void;
  onStartInterview: () => void;
}

export const InterviewHistoryPage: React.FC<InterviewHistoryPageProps> = ({
  onViewReport,
  onStartInterview,
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<FinalInterviewReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const list = localDb.getReports(user?.id);
    setReports(list);
  }, [user]);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.interviewType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || r.interviewType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview History & Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your past mock interview attempts, scores, and AI diagnostic reports.
          </p>
        </div>

        <button
          onClick={onStartInterview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/20 transition"
        >
          + Start New Interview
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by job role or track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
          {['All', 'Technical', 'HR', 'Coding', 'Aptitude'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-navy-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((r) => {
            const isGreat = r.overallScore >= 85;
            const isGood = r.overallScore >= 70 && r.overallScore < 85;
            return (
              <div
                key={r.id}
                className="p-5 sm:p-6 rounded-2xl bg-navy-900/80 border border-navy-800 hover:border-brand-500/40 transition shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">{r.jobRole}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {r.interviewType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {r.experienceLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {r.summary || 'Completed simulated interview with AI questioning and rubric assessment.'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.floor((r.durationSeconds || 600) / 60)}m {(r.durationSeconds || 600) % 60}s</span>
                    </span>
                    <span>{r.answers?.length || 5} questions answered</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end md:self-center flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Score</p>
                    <span
                      className={`text-lg font-extrabold ${
                        isGreat ? 'text-emerald-400' : isGood ? 'text-brand-400' : 'text-amber-400'
                      }`}
                    >
                      {r.overallScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onViewReport(r)}
                    className="px-4 py-2 rounded-xl bg-navy-800 group-hover:bg-brand-600 text-slate-200 group-hover:text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 space-y-3">
          <History className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-base font-semibold text-slate-400">No interview records match your filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs text-brand-400 hover:underline"
          >
            Clear Search Filters
          </button>
        </div>
      )}
    </div>
  );
};


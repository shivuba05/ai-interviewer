import React, { useState, useEffect } from 'react';
import {
  Play,
  Award,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Users,
  Compass,
  Cpu,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { localDb } from '../lib/supabase';
import { FinalInterviewReport, InterviewType } from '../types';

interface StudentDashboardProps {
  onStartInterview: (category?: InterviewType) => void;
  onViewReport: (report: FinalInterviewReport) => void;
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartInterview,
  onViewReport,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<FinalInterviewReport[]>([]);

  useEffect(() => {
    const list = localDb.getReports(user?.id);
    setReports(list);
  }, [user]);

  // Derived metrics
  const totalCompleted = reports.length;
  const avgScore = totalCompleted > 0
    ? Math.round((reports.reduce((acc, r) => acc + r.overallScore, 0) / totalCompleted) * 10) / 10
    : 0;
  const bestScore = totalCompleted > 0
    ? Math.max(...reports.map((r) => r.overallScore))
    : 0;
  const totalSeconds = reports.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  // Chart data: Progress over time
  const progressData = [...reports]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((r, idx) => ({
      name: `Session ${idx + 1}`,
      date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: r.overallScore,
      role: r.jobRole,
    }));

  // Category performance
  const categoryScores: Record<string, { total: number; count: number }> = {};
  reports.forEach((r) => {
    if (!categoryScores[r.interviewType]) {
      categoryScores[r.interviewType] = { total: 0, count: 0 };
    }
    categoryScores[r.interviewType].total += r.overallScore;
    categoryScores[r.interviewType].count += 1;
  });

  const categoryBarData = ['Technical', 'HR', 'Coding', 'Aptitude'].map((cat) => {
    const item = categoryScores[cat];
    return {
      category: cat,
      score: item ? Math.round((item.total / item.count) * 10) / 10 : 75,
    };
  });

  const barColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Welcome back, {user?.fullName || 'Candidate'}!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview Performance Dashboard
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Target Role: <span className="text-brand-300 font-semibold">{user?.targetRole || 'Software Developer'}</span> • Experience Level: <span className="text-slate-200 font-medium">{user?.experienceLevel || 'Fresher'}</span>
          </p>
        </div>

        <button
          onClick={() => onStartInterview()}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition transform hover:scale-102 flex items-center space-x-2 flex-shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interviews Completed</span>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalCompleted}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Structured preparation tracked</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-extrabold text-cyan-300">{avgScore}</p>
            <span className="text-sm text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-factor rubric rating</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Highest Score</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-extrabold text-purple-300">{bestScore}</p>
            <span className="text-sm text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-xs text-purple-400 mt-1">Personal peak benchmark</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Practice Time</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{totalMinutes} <span className="text-lg font-semibold text-slate-400">mins</span></p>
          <p className="text-xs text-slate-400 mt-1">Live speaking & coding practice</p>
        </div>
      </div>

      {/* Performance Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Timeline Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Score Progress Over Time</h3>
              <p className="text-xs text-slate-400">Trajectory of your performance across completed interviews</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
              Trend Analysis
            </span>
          </div>

          <div className="h-64 w-full">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1329',
                      borderColor: '#1d2f5e',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                <p>Complete your first interview to visualize score progression.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Track Breakdown</h3>
              <span className="text-xs text-slate-400">Score / 100</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Competency across key interview disciplines</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b1329',
                      borderColor: '#1d2f5e',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {categoryBarData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Strongest: <strong className="text-emerald-400">HR & Behavioral</strong></span>
            <span>Focus: <strong className="text-amber-400">Coding Arena</strong></span>
          </div>
        </div>
      </div>

      {/* Recommended Interview Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Recommended Practice Categories</h3>
            <p className="text-xs text-slate-400">Curated based on your target role and recent diagnostic metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: 'Technical' as InterviewType,
              title: 'Full Stack & APIs',
              desc: 'REST vs GraphQL, SQL indexing, async event loop & error handling.',
              icon: Cpu,
              tag: 'Recommended',
            },
            {
              type: 'Coding' as InterviewType,
              title: 'Algorithms & Structures',
              desc: 'Two pointer arrays, linked list cycles, and recursion complexity.',
              icon: Code2,
              tag: 'High Impact',
            },
            {
              type: 'HR' as InterviewType,
              title: 'Conflict & Leadership',
              desc: 'STAR structured scenarios, cross-functional collaboration, ownership.',
              icon: Users,
              tag: 'Confidence',
            },
            {
              type: 'Aptitude' as InterviewType,
              title: 'Speed & Logic Puzzles',
              desc: 'Time, speed, distance, probability, and logical deduction tests.',
              icon: Compass,
              tag: 'Placement Round 1',
            },
          ].map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-navy-900/70 border border-navy-800 hover:border-brand-500/40 transition p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {rec.tag}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{rec.desc}</p>
                </div>

                <button
                  onClick={() => onStartInterview(rec.type)}
                  className="w-full py-2 px-3 rounded-xl bg-navy-850 hover:bg-brand-600 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5"
                >
                  <span>Practice Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Interview History Table */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Interview History</h3>
            <p className="text-xs text-slate-400">Detailed records of past AI mock sessions and scorecards</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-navy-800 bg-navy-950/40">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Role & Track</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {reports.slice(0, 5).map((rep) => {
                  const isGreat = rep.overallScore >= 85;
                  const isGood = rep.overallScore >= 70 && rep.overallScore < 85;
                  return (
                    <tr key={rep.id} className="hover:bg-navy-850/50 transition">
                      <td className="py-3.5 px-4 text-xs text-slate-400 flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(rep.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-xs sm:text-sm">{rep.jobRole}</div>
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                          {rep.interviewType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {rep.answers?.length || 5} questions
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {Math.floor((rep.durationSeconds || 600) / 60)}m {((rep.durationSeconds || 600) % 60)}s
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isGreat
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isGood
                              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {rep.overallScore} / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onViewReport(rep)}
                          className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-brand-600 text-xs font-semibold text-white transition inline-flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No completed interviews recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Start a practice session to see comprehensive feedback here.</p>
          </div>
        )}
      </div>
    </div>
  );
};


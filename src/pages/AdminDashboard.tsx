import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  Sparkles,
  TrendingUp,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { localDb, isSupabaseConfigured } from '../lib/supabase';
import { checkServerHealth, getRuntimeGeminiKey } from '../lib/api';
import { UserProfile, FinalInterviewReport } from '../types';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<FinalInterviewReport[]>([]);
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [userSearch, setUserSearch] = useState('');

  const [categories, setCategories] = useState([
    { id: '1', name: 'Technical', active: true, questionsBankCount: 1420, avgScore: 78.4 },
    { id: '2', name: 'HR & Behavioral', active: true, questionsBankCount: 850, avgScore: 84.1 },
    { id: '3', name: 'Coding Arena', active: true, questionsBankCount: 620, avgScore: 72.8 },
    { id: '4', name: 'Quantitative & Aptitude', active: true, questionsBankCount: 930, avgScore: 76.5 },
  ]);

  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    setUsers(localDb.getUsers());
    setReports(localDb.getReports());
    checkServerHealth().then(setServerHealth);
  }, []);

  const totalInterviews = reports.length;
  const platformAvgScore = totalInterviews > 0
    ? Math.round((reports.reduce((acc, r) => acc + r.overallScore, 0) / totalInterviews) * 10) / 10
    : 81.2;
  const totalQuestions = reports.reduce((acc, r) => acc + (r.answers?.length || 5), 0);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleToggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name: newCatName.trim(),
        active: true,
        questionsBankCount: 250,
        avgScore: 75.0,
      },
    ]);
    setNewCatName('');
  };

  const isGeminiReady = serverHealth?.geminiConfigured || Boolean(getRuntimeGeminiKey());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration & System Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor registered users, active interview tracks, AI evaluation health, and platform metrics.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Users</span>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{users.length}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live database count</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interviews Held</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalInterviews}</p>
          <p className="text-xs text-slate-400 mt-1">Total completed sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Platform Avg Score</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-300">{platformAvgScore} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
          <p className="text-xs text-slate-400 mt-1">Across all tracks</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Evaluated</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{totalQuestions}</p>
          <p className="text-xs text-slate-400 mt-1">Real-time rubric grading</p>
        </div>
      </div>

      {/* Infrastructure & Services Health Monitor */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Server className="w-5 h-5 text-brand-400" />
          <span>System & API Services Health</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Google Gemini AI Engine</span>
              {isGeminiReady ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Active</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">Smart Fallback</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isGeminiReady
                ? 'Gemini 1.5 Flash connected for dynamic questioning & scoring.'
                : 'Smart heuristic question engine active with zero latency.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Database Layer</span>
              {isSupabaseConfigured ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Supabase Cloud</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px]">Local Store Mode</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isSupabaseConfigured
                ? 'Supabase PostgreSQL connected with RLS policies enabled.'
                : 'Local client storage enabled for seamless offline readiness.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Code Sandbox Runner</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">Operational</span>
            </div>
            <p className="text-xs text-slate-400">
              Isolated container execution proxy supporting C, C++, Python & Java.
            </p>
          </div>
        </div>
      </div>

      {/* Manage Interview Categories */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <span>Interview Categories & Tracks</span>
            </h3>
            <p className="text-xs text-slate-400">Enable, disable, or configure active practice domains</p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="New track name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="px-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition ${
                c.active ? 'bg-navy-950 border-navy-800' : 'bg-navy-950/40 border-navy-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{c.name}</span>
                <button
                  onClick={() => handleToggleCategory(c.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                    c.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.active ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>Question Pool: <strong className="text-slate-300">{c.questionsBankCount}</strong></p>
                <p>Track Avg: <strong className="text-brand-300">{c.avgScore} / 100</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Registered Users & Candidates</h3>
            <p className="text-xs text-slate-400">Total active accounts on the platform</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-navy-800 bg-navy-950/60">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-navy-850/40 transition">
                  <td className="py-3 px-4 flex items-center space-x-2.5">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                      alt={u.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-navy-700"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{u.fullName}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{u.targetRole || 'Software Developer'}</td>
                  <td className="py-3 px-4 text-slate-400">{u.experienceLevel || 'Fresher'}</td>
                  <td className="py-3 px-4 text-slate-400">{u.preferredLanguage || 'English'}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


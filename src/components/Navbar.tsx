import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  LayoutDashboard,
  Code2,
  FileText,
  History,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Play,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiKeyModal } from './ApiKeyModal';
import { checkServerHealth, getRuntimeGeminiKey } from '../lib/api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGeminiReady, setIsGeminiReady] = useState(false);

  useEffect(() => {
    checkServerHealth().then((health) => {
      setIsGeminiReady(health.geminiConfigured || Boolean(getRuntimeGeminiKey()));
    });
  }, [isKeyModalOpen]);

  const navItems = [
    { id: 'landing', label: 'Home', icon: BrainCircuit },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'coding', label: 'Coding Arena', icon: Code2 },
    { id: 'resume', label: 'Resume AI', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    ...(isAdmin
      ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-navy-800/80 bg-navy-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-brand-400 group-hover:text-cyan-300 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">AI Interviewer</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Smart Interview Preparation System</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* API Config Pill */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50 transition"
              title="AI Question & Evaluation Engine Active"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isGeminiReady ? 'Gemini AI: Live' : 'AI Engine: Active'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Admin Badge if logged in as Shivu */}
            {isAdmin && (
              <span className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin: Shivu</span>
              </span>
            )}

            {/* Start Interview CTA */}
            <button
              onClick={() => onNavigate('setup')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Interview</span>
            </button>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-navy-800 transition"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-lg object-cover border border-navy-700"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-navy-800">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-navy-800 hover:text-white flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsKeyModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-navy-800 hover:text-white flex items-center space-x-2"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>API Settings</span>
                    </button>

                    <div className="border-t border-navy-800 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl border border-navy-700 bg-navy-850 hover:bg-navy-800 text-white text-sm font-medium transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-850"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-navy-800 bg-navy-950 px-4 py-4 space-y-2 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                    currentView === item.id
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:bg-navy-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-navy-800 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsKeyModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm text-slate-300 bg-navy-900 border border-navy-800"
              >
                <Key className="w-4 h-4 text-brand-400" />
                <span>Configure Gemini API Key</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('setup');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start New Interview</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* API Key Modal */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
};


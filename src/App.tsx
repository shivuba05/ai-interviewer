import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider, useInterview } from './context/InterviewContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { InterviewRoom } from './pages/InterviewRoom';
import { FinalReportPage } from './pages/FinalReportPage';
import { CodingArenaPage } from './pages/CodingArenaPage';
import { ResumeInterviewPage } from './pages/ResumeInterviewPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { InterviewType, InterviewSetupConfig, FinalInterviewReport, ResumeData } from './types';
import { Sparkles, BrainCircuit, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InterviewType>('Technical');
  const [activeReport, setActiveReport] = useState<FinalInterviewReport | null>(null);

  const { startInterview, status, finalReport, resetInterview } = useInterview();

  // If session is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mandatory Authentication: If user is not logged in, show starting Login Page ONLY
  if (!user) {
    return <AuthPage />;
  }

  // Handlers
  const handleStartInterviewFromLanding = (category?: InterviewType) => {
    if (category) setSelectedCategory(category);
    setCurrentView('setup');
  };

  const handleLaunchInterview = async (config: InterviewSetupConfig) => {
    setCurrentView('room');
    await startInterview(config);
  };

  const handleStartResumeInterview = async (resume: ResumeData) => {
    const config: InterviewSetupConfig = {
      interviewType: 'Technical',
      jobRole: 'Software Engineer',
      experienceLevel: 'Fresher',
      difficulty: 'Medium',
      questionCount: 5,
      language: 'English',
      resumeId: resume.id,
      resumeText: resume.rawText,
    };
    setCurrentView('room');
    await startInterview(config);
  };

  const handleViewReport = (report: FinalInterviewReport) => {
    setActiveReport(report);
    setCurrentView('report');
  };

  const handleInterviewCompleted = () => {
    if (finalReport) {
      setActiveReport(finalReport);
    }
    setCurrentView('report');
  };

  const handleRetake = () => {
    resetInterview();
    setCurrentView('setup');
  };

  const handleDashboard = () => {
    resetInterview();
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view !== 'report') setActiveReport(null);
          setCurrentView(view);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {currentView === 'landing' && (
          <LandingPage
            onStartInterview={handleStartInterviewFromLanding}
            onNavigate={setCurrentView}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard
            onStartInterview={handleStartInterviewFromLanding}
            onViewReport={handleViewReport}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'setup' && (
          <InterviewSetupPage
            initialCategory={selectedCategory}
            onLaunchInterview={handleLaunchInterview}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'room' && (
          <InterviewRoom
            onComplete={handleInterviewCompleted}
            onExit={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'report' && activeReport && (
          <FinalReportPage
            report={activeReport}
            onRetake={handleRetake}
            onDashboard={handleDashboard}
          />
        )}

        {currentView === 'coding' && <CodingArenaPage />}

        {currentView === 'resume' && (
          <ResumeInterviewPage
            onStartResumeInterview={handleStartResumeInterview}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'history' && (
          <InterviewHistoryPage
            onViewReport={handleViewReport}
            onStartInterview={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-md mx-auto my-24 p-8 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Admin Access Restricted</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Admin Console is exclusively accessible to the platform administrator (<strong>shivuba005@gmail.com</strong>).
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-semibold text-xs transition"
              >
                Go to Student Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800/80 bg-navy-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">AI Interviewer</span>
            <span>– Smart Interview Preparation System</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <button onClick={() => setCurrentView('landing')} className="hover:text-white transition">Home</button>
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition">Dashboard</button>
            <button onClick={() => setCurrentView('coding')} className="hover:text-white transition">Coding</button>
            <button onClick={() => setCurrentView('resume')} className="hover:text-white transition">Resume AI</button>
            {isAdmin && (
              <button onClick={() => setCurrentView('admin')} className="hover:text-white transition">Admin</button>
            )}
          </div>

          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} AI Interviewer Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <AppContent />
      </InterviewProvider>
    </AuthProvider>
  );
}

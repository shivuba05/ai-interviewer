import React from 'react';
import {
  Play,
  BrainCircuit,
  Mic,
  Code2,
  FileCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Terminal,
  Cpu,
  Users,
  Compass,
  Star,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { InterviewType } from '../types';

interface LandingPageProps {
  onStartInterview: (category?: InterviewType) => void;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onNavigate,
  onOpenAuth,
}) => {
  const categories: {
    type: InterviewType;
    title: string;
    description: string;
    icon: any;
    color: string;
    badge: string;
    roles: string[];
  }[] = [
    {
      type: 'Technical',
      title: 'Technical Interviews',
      description: 'System design, database internals, REST APIs, OOP concepts, frameworks, and architecture.',
      icon: Cpu,
      color: 'from-blue-600 to-cyan-500',
      badge: 'Most Popular',
      roles: ['Software Developer', 'Web Developer', 'Python Developer', 'Data Analyst'],
    },
    {
      type: 'HR',
      title: 'HR & Behavioral',
      description: 'Culture fit, STAR method situational questions, conflict management, teamwork, and leadership.',
      icon: Users,
      color: 'from-purple-600 to-pink-500',
      badge: 'Essential',
      roles: ['All Roles', 'Freshers', 'Senior Engineers', 'Project Managers'],
    },
    {
      type: 'Coding',
      title: 'Coding Arena',
      description: 'Live code editor in C, C++, Python, and Java with secure execution, test cases, and AI review.',
      icon: Code2,
      color: 'from-emerald-600 to-teal-500',
      badge: 'Interactive',
      roles: ['Algorithms', 'Data Structures', 'LeetCode Style', 'Dynamic Programming'],
    },
    {
      type: 'Aptitude',
      title: 'Quantitative & Aptitude',
      description: 'Speed-math, logical puzzles, work & time, data sufficiency, and critical analytical reasoning.',
      icon: Compass,
      color: 'from-amber-600 to-orange-500',
      badge: 'Campus Placement',
      roles: ['Campus Drives', 'Banking Tech', 'Consulting', 'Entry-Level Tests'],
    },
  ];

  const features = [
    {
      icon: BrainCircuit,
      title: 'Dynamic Gemini AI Questioning',
      description:
        'Never face static question banks. Gemini AI assesses previous responses and crafts insightful follow-up questions with adaptive difficulty in real time.',
    },
    {
      icon: Mic,
      title: 'Voice-First Conversational Experience',
      description:
        'Practice speaking aloud with bidirectional Web Speech recognition and text-to-speech. AI interviewer speaks questions aloud and listens naturally.',
    },
    {
      icon: Award,
      title: 'Instant 6-Factor AI Evaluation',
      description:
        'Every answer is evaluated across relevance, technical correctness, communication clarity, completeness, and problem-solving with a score out of 10.',
    },
    {
      icon: FileCheck,
      title: 'Resume-Personalized Scenarios',
      description:
        'Upload your PDF resume to have Gemini parse your personal projects, tech stack, and experience into tailored deep-dive interview questions.',
    },
    {
      icon: Terminal,
      title: 'Multi-Language Coding Arena',
      description:
        'Write and compile C, C++, Python, and Java code in a full Monaco editor. Run tests in an isolated execution sandbox with instant Big-O complexity feedback.',
    },
    {
      icon: TrendingUp,
      title: 'Executive PDF Performance Reports',
      description:
        'Generate an exhaustive performance dossier with overall 100-point score, question metrics, strengths, weaknesses, and downloadable PDF report.',
    },
  ];

  const testimonials = [
    {
      name: 'Rohan Sharma',
      role: 'Associate Software Engineer at Flipkart',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      text: 'The voice-based AI interview felt remarkably close to real hiring rounds. The adaptive follow-up questions tested whether I truly understood my projects.',
      rating: 5,
    },
    {
      name: 'Priya Venkatesh',
      role: 'Frontend Developer at Razorpay',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      text: 'Being able to practice in Kannada and English boosted my confidence tremendously. The suggested better answers helped me structure my thoughts using STAR.',
      rating: 5,
    },
    {
      name: 'Aditya Nair',
      role: 'Data Analyst at TechCorp',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      text: 'The PDF resume parser asked direct questions about my SQL and Pandas projects that almost matched my actual interview questions verbatim!',
      rating: 5,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-500/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1400px] -right-48 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs sm:text-sm font-medium mb-8 animate-fade-in shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Powered by Google Gemini 1.5 & Bidirectional Voice AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Practice Interviews.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-brand-300 bg-clip-text text-transparent">
            Improve Confidence.
          </span>{' '}
          Get Hired.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          Master your dream job interviews with our real-time AI interviewer. Experience dynamic voice questions, resume-targeted probes, live coding tests, and in-depth performance diagnostics.
        </p>

        {/* Hero Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onStartInterview()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-brand-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 group"
          >
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition" />
            <span>Start Practice Interview</span>
            <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onNavigate('coding')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-navy-900/90 hover:bg-navy-850 border border-navy-700 hover:border-brand-500/40 text-slate-200 hover:text-white font-semibold text-base transition flex items-center justify-center space-x-2.5 shadow-lg"
          >
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>Open Coding Arena</span>
          </button>
        </div>

        {/* Key Metrics Strip */}
        <div className="mt-16 pt-10 border-t border-navy-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div>
            <p className="text-3xl font-extrabold text-white">45,000+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Mock Interviews</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-400">94.8%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Placement Rate</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-400">3 Languages</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">English, Kannada, Hindi</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-purple-400">&lt; 1 sec</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">AI Feedback Speed</p>
          </div>
        </div>
      </section>

      {/* Interview Categories Section */}
      <section className="py-20 bg-navy-900/40 border-y border-navy-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-brand-400 tracking-wider uppercase mb-2">
              Comprehensive Preparation
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Select Your Interview Track
            </h3>
            <p className="text-slate-400 mt-3 text-base">
              Choose from tailored categories designed by tech leads to simulate genuine hiring loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.type}
                  className="bg-navy-900/90 border border-navy-800 hover:border-brand-500/50 rounded-2xl p-6 transition transform hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} p-0.5 shadow-md`}>
                        <div className="w-full h-full bg-navy-900 rounded-[10px] flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700">
                        {cat.badge}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2">{cat.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{cat.description}</p>

                    <div className="space-y-1.5 mb-6">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Covered Roles:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.roles.map((r, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded bg-navy-850 text-slate-300 border border-navy-700/60"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartInterview(cat.type)}
                    className="w-full py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-brand-600 text-slate-200 hover:text-white font-semibold text-sm transition flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-brand-500/20"
                  >
                    <span>Practice {cat.type}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-cyan-400 tracking-wider uppercase mb-2">
            Engineered for Mastery
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Next-Gen AI Interview Technology
          </h3>
          <p className="text-slate-400 mt-3 text-base">
            Every feature is designed to sharpen your communication, technical precision, and composure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-7 rounded-2xl bg-navy-900/60 border border-navy-800/80 hover:border-brand-500/40 transition hover:bg-navy-900 shadow-xl relative overflow-hidden group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 mb-5 group-hover:scale-110 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-navy-900/50 border-t border-navy-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-400 tracking-wider uppercase mb-2">
              Seamless Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How the AI Interviewer Works
            </h3>
            <p className="text-slate-400 mt-3 text-base">
              Four structured steps from setup to comprehensive performance mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Configure Your Track',
                desc: 'Select your role (Software Dev, Web, Python, Data), experience level, difficulty, and preferred language.',
              },
              {
                step: '02',
                title: 'Upload Resume (Optional)',
                desc: 'Attach your PDF resume so our system parses your personal projects and asks targeted situational questions.',
              },
              {
                step: '03',
                title: 'Attend Live Voice Interview',
                desc: 'Speak your answers via microphone or type them. The AI speaks questions, listens, and probes deeper.',
              },
              {
                step: '04',
                title: 'Analyze & Download Report',
                desc: 'Receive immediate scores out of 10 per answer, review key strengths & weaknesses, and export a PDF report.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-navy-950 border border-navy-800 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent mb-3 block">
                    {step.step}
                  </span>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-2">
            Candidate Testimonials
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Real Candidates, Genuine Offers
          </h3>
          <p className="text-slate-400 mt-3 text-base">
            See how aspiring and experienced engineers prepare and excel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-7 rounded-2xl bg-navy-900/70 border border-navy-800 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed mb-6">"{t.text}"</p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-navy-800/80">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover border border-brand-500/30"
                />
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-900 via-brand-950 to-navy-900 border border-brand-500/30 p-8 sm:p-14 text-center shadow-2xl">
          <div className="absolute inset-0 bg-radial-at-c from-brand-500/10 to-transparent pointer-events-none" />
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            Start a free mock interview session now. Test with voice, practice coding, and receive an instant report.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartInterview()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-brand-500/25 transition flex items-center space-x-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Mock Interview</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 text-white font-medium text-base border border-navy-700 transition"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { X, Key, Database, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { checkServerHealth, getRuntimeGeminiKey, setRuntimeGeminiKey } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getRuntimeGeminiKey() || '';
      setApiKey(stored);
      checkServerHealth().then(setServerHealth);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setRuntimeGeminiKey(apiKey.trim());

    // Also notify backend
    try {
      await fetch('/api/config/set-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
    } catch (e) {}

    const updated = await checkServerHealth();
    setServerHealth(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const isGeminiReady = serverHealth?.geminiConfigured || Boolean(getRuntimeGeminiKey());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-navy-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-850/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Platform Configuration & API Keys</h3>
              <p className="text-xs text-slate-400">Manage Gemini AI and Supabase connectivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border bg-emerald-950/30 border-emerald-500/30 text-emerald-300">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Interview Engine</span>
              </div>
              <div className="text-sm font-medium flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-white">
                  {isGeminiReady ? 'Live Gemini Cloud API' : 'Smart AI Engine (Ready)'}
                </span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${isSupabaseConfigured ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-brand-950/40 border-brand-500/30 text-brand-300'}`}>
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Database</span>
              </div>
              <div className="text-sm font-medium flex items-center space-x-1.5">
                {isSupabaseConfigured ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white">Supabase Cloud</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    <span className="text-white">Local Storage Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-slate-200">
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-navy-950 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Your API key is transmitted securely to the server and never exposed in client bundles. If left blank, the platform automatically utilizes its high-precision built-in question generation engine.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Environment File Configuration (.env):</p>
              <p className="font-mono text-[11px] text-brand-300">GEMINI_API_KEY=your_key_here</p>
              <p className="font-mono text-[11px] text-brand-300">VITE_SUPABASE_URL=https://xyz.supabase.co</p>
              <p className="font-mono text-[11px] text-brand-300">VITE_SUPABASE_ANON_KEY=eyJ...</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-lg shadow-brand-500/20 transition disabled:opacity-50 flex items-center space-x-2"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Saved Successfully!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


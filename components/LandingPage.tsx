
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../types';
import Auth from './Auth';
import { askTutor } from '../services/geminiService';

interface LandingPageProps {
  currentAuthScreen: AppScreen;
  onAuth: (email: string, pass: string) => void;
  onNavigate: (screen: AppScreen) => void;
  loading: boolean;
  error?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  currentAuthScreen, 
  onAuth, 
  onNavigate, 
  loading, 
  error 
}) => {
  const [previewQuestion, setPreviewQuestion] = useState('');
  const [previewResponse, setPreviewResponse] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  
  const authRef = useRef<HTMLDivElement>(null);

  const handlePreviewAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewQuestion.trim() || isPreviewLoading) return;
    
    setIsPreviewLoading(true);
    try {
      // Temporary placeholder context for the preview
      const guestContext = { topic: "General Knowledge", lesson: "", summary: [], quiz: [], next_topics: [] };
      const response = await askTutor(previewQuestion, guestContext, []);
      setPreviewResponse(response);
      setHasAsked(true);
    } catch (err) {
      setPreviewResponse("TutorX is processing many requests. Please register to unlock priority access.");
      setHasAsked(true);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (hasAsked && authRef.current) {
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [hasAsked]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none">
                For high school & university students
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
                Master Any Subject with <span className="text-indigo-600 dark:text-indigo-400">AI Precision.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-bold max-w-xl mx-auto lg:mx-0">
                Ask questions. Get step-by-step explanations. Study smarter.
              </p>
            </div>

            {/* Pre-Auth Question Bar */}
            <div className="space-y-6">
              {!previewResponse ? (
                <form onSubmit={handlePreviewAsk} className="relative group max-w-xl mx-auto lg:mx-0">
                  <input 
                    type="text" 
                    value={previewQuestion}
                    onChange={(e) => setPreviewQuestion(e.target.value)}
                    placeholder="Ask your toughest study question..." 
                    className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-bold shadow-2xl focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={isPreviewLoading || !previewQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isPreviewLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-bottom-4 max-w-xl mx-auto lg:mx-0 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16"></div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">TutorX Instant Explanation</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">"{previewResponse}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Masterclass Unlocked. Register to save your progress.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                 Wally Nthani • TutorX Neural Engine
               </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto" ref={authRef}>
            {hasAsked ? (
              <div className="animate-success-pop duration-700">
                <Auth 
                  type={currentAuthScreen} 
                  onAuth={onAuth} 
                  onNavigate={onNavigate} 
                  loading={loading} 
                  error={error} 
                />
              </div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center space-y-6 opacity-20 grayscale pointer-events-none transition-all duration-1000">
                 <div className="w-64 h-80 bg-slate-200 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <div className="text-center space-y-2">
                       <svg className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portal Locked</p>
                    </div>
                 </div>
                 <p className="text-xs font-bold text-slate-400">Ask a question to unlock registration</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Summary */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Academic Clearance Levels</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Precision tools for high school and university curriculum.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Easy Mode</h3>
              <p className="text-sm text-slate-500 font-medium">Clear, foundational explanations using simple analogies for new topics.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-500 space-y-4 shadow-xl">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">In-Depth</h3>
              <p className="text-sm text-slate-500 font-medium">Deep structural analysis and logical mapping for complex subjects.</p>
            </div>
            <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-indigo-500/30 space-y-4 text-white">
              <h3 className="text-xl font-black text-white">Exam-Ready</h3>
              <p className="text-sm text-slate-400 font-medium">High-level academic responses focused on technical accuracy and exams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-20 px-4 text-center space-y-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-loose">
             Secure Infrastructure • Privacy Guaranteed • Built in South Africa
           </p>
           <p className="text-xs text-slate-400 font-medium">Developed by Wally Nthani • © 2025 TutorX AI Masterclass Engine</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

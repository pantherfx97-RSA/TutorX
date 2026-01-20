
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
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState<'High School' | 'University'>('High School');
  const [examType, setExamType] = useState('');
  const [previewQuestion, setPreviewQuestion] = useState('');
  
  const [previewResponse, setPreviewResponse] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const authRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handlePreviewAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewQuestion.trim() || !subject.trim() || isPreviewLoading) return;
    
    setIsPreviewLoading(true);
    try {
      const guestContext = { 
        topic: `Initial Inquiry: ${subject}`, 
        lesson: "", 
        summary: [], 
        quiz: [], 
        next_topics: [] 
      };
      const complexPrompt = `
        [Academic Level: ${level}]
        [Subject: ${subject}]
        [Exam Focus: ${examType}]
        Question: ${previewQuestion}
      `;
      const response = await askTutor(complexPrompt, guestContext, []);
      setPreviewResponse(response);
      setShowPortal(true);
    } catch (err) {
      setPreviewResponse("Neural Link Busy. Please initialize your account to get priority access.");
      setShowPortal(true);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (showPortal && authRef.current) {
      setTimeout(() => {
        authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [showPortal]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* PWA Install Button (Sticky Top) */}
      {deferredPrompt && (
        <div className="fixed top-0 left-0 right-0 z-[60] p-3 flex justify-center animate-in slide-in-from-top duration-500">
          <button 
            onClick={handleInstall}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Install TutorX App
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          <div className="space-y-8 text-center lg:text-left pt-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none">
                Elite AI Learning Engine
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
                Smarter Study, <span className="text-indigo-600 dark:text-indigo-400">Higher Grades.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-bold max-w-xl mx-auto lg:mx-0">
                The most precise AI tutor for University and High School curriculum.
              </p>
            </div>

            <div className="space-y-6">
              {!previewResponse ? (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 max-w-xl mx-auto lg:mx-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Clearance Checklist</span>
                  </div>

                  <form onSubmit={handlePreviewAsk} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Subject Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Physics, Law..." 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Exam Type</label>
                        <input 
                          type="text" 
                          placeholder="e.g. NSC, IEB, Midterm..." 
                          value={examType}
                          onChange={(e) => setExamType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Academic Level</label>
                      <div className="flex p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button 
                          type="button" 
                          onClick={() => setLevel('High School')}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${level === 'High School' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                          High School
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setLevel('University')}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${level === 'University' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                          University
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Your Question</label>
                      <textarea 
                        value={previewQuestion}
                        onChange={(e) => setPreviewQuestion(e.target.value)}
                        placeholder="What concept do you want to understand right now?" 
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold focus:border-indigo-500 outline-none transition-all resize-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isPreviewLoading || !previewQuestion.trim() || !subject.trim()}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isPreviewLoading ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <>
                          Initialize Protocol
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-bottom-4 max-w-xl mx-auto lg:mx-0 shadow-2xl relative">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">TutorX Neural Response</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">"{previewResponse}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Analysis complete. Register below to save this lesson.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-md mx-auto" ref={authRef}>
            {showPortal ? (
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
              <div className="hidden lg:flex flex-col items-center justify-center space-y-6 opacity-20 grayscale pointer-events-none transition-opacity duration-1000 mt-20">
                 <div className="w-64 h-80 bg-slate-200 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <div className="text-center space-y-2">
                       <svg className="h-10 w-10 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Portal</p>
                    </div>
                 </div>
                 <p className="text-xs font-bold text-slate-400">Initialize a briefing to unlock</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-20 px-4 text-center space-y-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] leading-loose">
             Secure Infrastructure • Privacy Guaranteed • Built in South Africa
           </p>
           <p className="text-xs text-slate-400 font-medium">Developed by Cipher X Inc • Founder: Wally Nthani • © 2025 TutorX</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

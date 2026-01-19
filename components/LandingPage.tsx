
import React from 'react';
import { AppScreen, SubscriptionTier } from '../types';
import Auth from './Auth';

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
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Hero Section with Auth */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Next-Gen Learning Protocol
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
              Master Any Subject with <span className="text-indigo-600 dark:text-indigo-400">AI Precision.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0">
              Personalized masterclasses, interactive quizzes, and deep AI insights. Developed by Wally Nthani for the innovators of tomorrow.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                     {String.fromCharCode(64 + i)}
                   </div>
                 ))}
               </div>
               <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                 Joined by 12,000+ Students
               </p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <Auth 
              type={currentAuthScreen} 
              onAuth={onAuth} 
              onNavigate={onNavigate} 
              loading={loading} 
              error={error} 
            />
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
           <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" />
           </svg>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Clearance Levels</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Choose the intelligence tier that matches your learning velocity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8 flex flex-col group hover:shadow-2xl transition-all duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Protocol</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">FREE</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Essential AI learning for curious minds.</p>
              </div>
              <ul className="flex-1 space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Basic Masterclasses
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Foundation Quizzes
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                   <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   No Advanced Reasoning
                </li>
              </ul>
              <button onClick={() => onNavigate(AppScreen.REGISTER)} className="w-full py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95">Select Guest</button>
            </div>

            {/* Premium Tier */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-4 border-indigo-600 space-y-8 flex flex-col relative transform scale-105 shadow-2xl z-10 shadow-indigo-200 dark:shadow-none">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">Most Popular</div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Elite Protocol</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">PREMIUM</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Unlock deep-dive reasoning and history.</p>
              </div>
              <ul className="flex-1 space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Deep Reasoning Path
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Full Progress Analytics
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Priority AI Curation
                </li>
              </ul>
              <button onClick={() => onNavigate(AppScreen.REGISTER)} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all active:scale-95">Go Elite</button>
            </div>

            {/* Pro Tier */}
            <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-indigo-500/30 space-y-8 flex flex-col group hover:shadow-2xl transition-all duration-500 text-white">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Infinite Protocol</span>
                <h3 className="text-3xl font-black text-white">PRO</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">The ultimate academic advantage.</p>
              </div>
              <ul className="flex-1 space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-indigo-200">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  AI Voice Synthesis
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-indigo-200">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Advanced Difficulty (Elite)
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-indigo-200">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Unlimited Tutor Chat
                </li>
              </ul>
              <button onClick={() => onNavigate(AppScreen.REGISTER)} className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all active:scale-95">Go Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-20 px-4 text-center space-y-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-none transition-transform hover:scale-110 active:scale-90">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <path d="M18 18L46 46" stroke="white" strokeWidth="8" strokeLinecap="round" />
              <path d="M46 18L18 46" stroke="white" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.4" />
              <circle cx="32" cy="32" r="5" fill="white" className="animate-pulse" />
            </svg>
           </div>
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

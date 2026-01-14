
import React, { useState } from 'react';
import { AppScreen } from '../types';
import { DEVELOPER_CREDIT } from '../constants';

interface AuthProps {
  type: AppScreen;
  onAuth: (email: string, pass: string) => void;
  onNavigate: (screen: AppScreen) => void;
  loading: boolean;
  error?: string;
}

const Auth: React.FC<AuthProps> = ({ type, onAuth, onNavigate, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(email, password);
  };

  const title = type === AppScreen.LOGIN ? "Welcome Back" : type === AppScreen.REGISTER ? "Create Account" : "Reset Password";
  const subtitle = type === AppScreen.LOGIN ? "Ready to learn something new today?" : type === AppScreen.REGISTER ? "Join the AI learning revolution." : "Enter your email to receive a reset link.";

  // High-Tech Orbital Brain Logo
  const BrandLogo = () => (
    <div className="flex flex-col items-center mb-8 relative">
      <div className="relative group">
        <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl group-hover:from-indigo-500/30 transition-all duration-700"></div>
        
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-500 group-hover:scale-105">
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%"><pattern id="auth-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#auth-grid)" /></svg>
          </div>

          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M50 15 L85 35 L85 65 L50 85 L15 65 L15 35 Z" stroke="url(#logo-grad)" strokeWidth="4" fill="none" className="opacity-30" />
              <path d="M50 25 L75 40 L75 60 L50 75 L25 60 L25 40 Z" stroke="url(#logo-grad)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <circle cx="50" cy="50" r="8" fill="url(#logo-grad)" className="animate-pulse" />
              <circle cx="50" cy="50" r="15" stroke="url(#logo-grad)" strokeWidth="2" strokeDasharray="4 8" className="animate-spin" style={{ animationDuration: '8s' }} />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="mt-5 flex items-center space-x-1">
        <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Tutor</span>
        <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">X</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in duration-500 border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <BrandLogo />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium leading-tight px-4">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs sm:text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400 text-sm sm:text-base"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {type !== AppScreen.FORGOT_PASSWORD && (
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400 text-sm sm:text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {type === AppScreen.LOGIN && (
            <div className="text-right">
              <button type="button" onClick={() => onNavigate(AppScreen.FORGOT_PASSWORD)} className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">Forgot Password?</button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 sm:py-5 px-6 rounded-2xl text-white font-black text-base sm:text-lg shadow-xl transition-all active:scale-[0.98] ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'}`}
          >
            {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</span> : type === AppScreen.LOGIN ? 'Sign In' : type === AppScreen.REGISTER ? 'Create Account' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm pt-2">
          {type === AppScreen.LOGIN ? (
            <p>New to TutorX? <button onClick={() => onNavigate(AppScreen.REGISTER)} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Register</button></p>
          ) : (
            <p>Already joined? <button onClick={() => onNavigate(AppScreen.LOGIN)} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Sign In</button></p>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">{DEVELOPER_CREDIT}</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

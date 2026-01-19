
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

  // New Neural-X Brand Logo
  const BrandLogo = () => (
    <div className="flex flex-col items-center mb-8 relative">
      <div className="relative group">
        <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl group-hover:from-indigo-500/30 transition-all duration-700"></div>
        
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%"><pattern id="auth-grid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#auth-grid)" /></svg>
          </div>

          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full animate-float">
              <path d="M18 18L46 46" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
              <path d="M46 18L18 46" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.3" />
              <circle cx="32" cy="32" r="6" fill="#6366f1" className="animate-pulse" />
              <circle cx="32" cy="32" r="14" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 8" className="animate-spin" style={{ animationDuration: '6s' }} />
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
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 sm:p-10 space-y-6 animate-in fade-in zoom-in duration-500 border border-slate-100 dark:border-slate-800">
      <div className="text-center">
        <BrandLogo />
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium leading-tight px-4">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs sm:text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Email Protocol</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm sm:text-base"
              placeholder="operator@tutorx.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {type !== AppScreen.FORGOT_PASSWORD && (
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Security Key</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-sm sm:text-base"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        {type === AppScreen.LOGIN && (
          <div className="text-right">
            <button type="button" onClick={() => onNavigate(AppScreen.FORGOT_PASSWORD)} className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Lost Password?</button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 px-6 rounded-2xl text-white font-black text-base sm:text-lg shadow-xl transition-all active:scale-95 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none'}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          ) : (
            type === AppScreen.LOGIN ? 'Synchronize' : type === AppScreen.REGISTER ? 'Initialize' : 'Reset Protocol'
          )}
        </button>
      </form>

      <div className="text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm pt-2 font-medium">
        {type === AppScreen.LOGIN ? (
          <p>New to the network? <button onClick={() => onNavigate(AppScreen.REGISTER)} className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">Register Access</button></p>
        ) : (
          <p>Already registered? <button onClick={() => onNavigate(AppScreen.LOGIN)} className="font-black text-indigo-600 dark:text-indigo-400 hover:underline">Enter Portal</button></p>
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">{DEVELOPER_CREDIT}</p>
      </div>
    </div>
  );
};

export default Auth;


import React from 'react';
import { DEVELOPER_CREDIT, APP_NAME } from '../constants';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onLogout?: () => void;
  onNavigate?: (screen: AppScreen) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  activeScreen?: AppScreen;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userEmail, 
  onLogout, 
  onNavigate, 
  isDarkMode, 
  toggleDarkMode,
  activeScreen
}) => {
  const isDashboard = activeScreen === AppScreen.DASHBOARD;
  const isProfile = activeScreen === AppScreen.PROFILE;
  const isPlans = activeScreen === AppScreen.PLANS;
  const isLearning = activeScreen === AppScreen.LEARNING;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center h-16 px-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate?.(AppScreen.DASHBOARD)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transform transition-all group-hover:rotate-12 group-hover:scale-110 active:scale-90">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M18 18L46 46" stroke="white" strokeWidth="8" strokeLinecap="round" />
                <path d="M46 18L18 46" stroke="white" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.4" />
                <circle cx="32" cy="32" r="5" fill="white" className="animate-pulse" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800 dark:text-slate-100">
              Tutor<span className="text-indigo-600 dark:text-indigo-400">X</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation */}
            {userEmail && (
              <nav className="hidden md:flex items-center space-x-1 mr-2">
                <button
                  onClick={() => onNavigate?.(AppScreen.PLANS)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPlans ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Membership
                </button>
                <button
                  onClick={() => onNavigate?.(AppScreen.PROFILE)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isProfile ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Profile
                </button>
              </nav>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 active:scale-90"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
              )}
            </button>

            {userEmail && (
              <button 
                onClick={onLogout}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                <span className="hidden xs:inline">Log Out</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 transition-all duration-300 ${userEmail ? 'mb-24 sm:mb-16' : 'mb-0'}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {userEmail && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => onNavigate?.(AppScreen.DASHBOARD)}
            className={`flex flex-col items-center gap-1 transition-all ${isDashboard || isLearning ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isDashboard || isLearning ? 3 : 2}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Study</span>
          </button>
          
          <button 
            onClick={() => onNavigate?.(AppScreen.PLANS)}
            className={`flex flex-col items-center gap-1 transition-all ${isPlans ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isPlans ? 3 : 2}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Plans</span>
          </button>

          <button 
            onClick={() => onNavigate?.(AppScreen.PROFILE)}
            className={`flex flex-col items-center gap-1 transition-all ${isProfile ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isProfile ? 3 : 2}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
          </button>
        </nav>
      )}

      {/* Footer Acknowledgment (Desktop only or static) */}
      <footer className="hidden sm:block bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
            {DEVELOPER_CREDIT}
          </p>
          <div className="flex justify-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">
            <span>&copy; {new Date().getFullYear()} TutorX</span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full my-auto"></span>
            <span>AI Masterclass Engine</span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full my-auto"></span>
            <span>Build v1.2.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

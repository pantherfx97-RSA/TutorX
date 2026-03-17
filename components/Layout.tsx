import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calculator, 
  Brain,
  Map, 
  CreditCard, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Bookmark,
  Settings
} from 'lucide-react';
import { UserProfile } from '../types';
import { firebaseService } from '../services/firebaseService';

import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile;
  activeView: string;
  onViewChange: (view: string) => void;
  onUpgradeClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  profile, 
  activeView, 
  onViewChange,
  onUpgradeClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'Dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'Masterclasses', icon: <BookOpen size={20} />, label: 'Masterclasses' },
    { id: 'Progress', icon: <TrendingUp size={20} />, label: 'Progress' },
    { id: 'Saved', icon: <Bookmark size={20} />, label: 'Saved' },
    { id: 'AITutor', icon: <Brain size={20} />, label: 'AI Tutor' },
    { id: 'MathGuru', icon: <Calculator size={20} />, label: 'Math Guru' },
    { id: 'Settings', icon: <Settings size={20} />, label: 'Settings' },
    { id: 'Profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-indigo-500/30 selection:text-white text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 flex-col bg-slate-950 border-r border-white/5 p-8 fixed h-full z-40">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Brain size={26} className="relative z-10" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white font-display">TutorX</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] font-bold transition-all duration-500 group relative overflow-hidden ${
                activeView === item.id 
                  ? 'text-white' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-500 relative z-10 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="tracking-tight relative z-10 text-lg">{item.label}</span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-8">
          <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.25em] text-[11px] mb-4">
                <Zap size={14} fill="currentColor" className="animate-pulse" />
                Neural Capacity
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                />
              </div>
              <p className="text-[11px] text-slate-500 font-bold mb-6">4/10 Daily Questions Used</p>
              <button 
                onClick={onUpgradeClick}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Evolve to Pro
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
          </div>

          <button 
            onClick={() => firebaseService.logout()}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-400/10 transition-colors">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="tracking-tight text-lg">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        {/* Header - Mobile & Desktop */}
        <header className="h-20 md:h-28 bg-slate-950/50 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-30 px-6 md:px-12 flex items-center justify-between">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-3 md:p-4 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 transition-all active:scale-95"
          >
            <Menu className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-lg font-black text-white font-display tracking-tight">{profile.fullName}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">{profile.tier} Member</p>
              </div>
            </div>
            <button 
              onClick={() => onViewChange('Profile')}
              className="w-14 h-14 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center font-black text-xl overflow-hidden border-4 border-white/5 shadow-2xl hover:scale-110 transition-all active:scale-95 relative group"
            >
              <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              {profile.fullName.charAt(0)}
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <Footer 
          onPrivacyClick={() => onViewChange('Privacy')}
          onTermsClick={() => onViewChange('Terms')}
          onContactClick={() => onViewChange('Contact')}
        />
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-slate-950 z-[70] lg:hidden p-8 flex flex-col shadow-2xl border-r border-white/5"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Brain size={20} />
                  </div>
                  <span className="text-2xl font-black tracking-tighter font-display text-white">TutorX</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 bg-white/5 rounded-xl text-slate-400 hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                      activeView === item.id 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="tracking-tight">{item.label}</span>
                  </button>
                ))}
              </nav>

              <button 
                onClick={() => firebaseService.logout()}
                className="mt-auto flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/5 transition-all"
              >
                <LogOut size={20} />
                <span className="tracking-tight">Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;

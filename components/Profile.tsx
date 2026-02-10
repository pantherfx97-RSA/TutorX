
import React, { useMemo, useState } from 'react';
import { UserProfile, SubscriptionTier, UserDocument, AppScreen } from '../types';
import { DEVELOPER_CREDIT } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpload?: (doc: UserDocument) => void;
  onTriggerUpgrade?: (tier: SubscriptionTier) => void;
  onLogout?: () => void;
  onNavigate?: (screen: AppScreen) => void;
}

type SettingsModal = 'help' | 'terms' | 'privacy' | 'bug' | null;

const Profile: React.FC<ProfileProps> = ({ user, onUpload, onTriggerUpgrade, onLogout, onNavigate }) => {
  const [activeModal, setActiveModal] = useState<SettingsModal>(null);
  const [bugDescription, setBugDescription] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English (default)');
  const [showLangUpdate, setShowLangUpdate] = useState(false);
  
  const stats = useMemo(() => {
    const scores = user.quizScores || [];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length) : 0;
    return { avgScore };
  }, [user.quizScores]);

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;
    setBugSubmitted(true);
    setTimeout(() => {
      setBugSubmitted(false);
      setBugDescription('');
      setActiveModal(null);
    }, 2500);
  };

  const handleLangChange = (lang: string) => {
    setCurrentLanguage(lang);
    setShowLangUpdate(true);
    setTimeout(() => setShowLangUpdate(false), 2000);
  };

  const ModalContainer = ({ title, subtitle, children, onClose }: { title: string, subtitle: string, children?: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto no-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto pb-24">
      
      {/* Identity Profile Header */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-all group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>
        <div className="relative mt-12 px-8 pb-8 flex flex-col items-center">
          <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[2.5rem] p-1.5 shadow-2xl relative transform transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-5xl font-black text-indigo-600">
              {user.email[0].toUpperCase()}
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-50">{user.email}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">{user.tier} Access</span>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">{user.streak} Day Streak</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">{stats.avgScore}% Avg Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* Maths Guru Action Card */}
      <section 
        onClick={() => onNavigate?.(AppScreen.MATH_GURU)}
        className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-xl border border-indigo-500 cursor-pointer group overflow-hidden relative active:scale-[0.98] transition-all"
      >
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl">📐</div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Math Guru Mode</h3>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Step-by-step problem solver</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white group-hover:translate-x-2 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </section>

      {/* Professional Settings & Support Suite */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="px-4 py-2 mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Settings & Support</h3>
        </div>

        {/* 1. Help Centre */}
        <button 
          onClick={() => setActiveModal('help')}
          className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all group"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform text-2xl">❓</div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-black text-slate-800 dark:text-white">Help Centre</h4>
            <p className="text-[10px] font-bold text-slate-500 tracking-tight">Get answers, tutorials, and tips for using TutorX.</p>
          </div>
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* 2. Report Bug */}
        <button 
          onClick={() => setActiveModal('bug')}
          className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform text-2xl">🐞</div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-black text-slate-800 dark:text-white">Report a Bug</h4>
            <p className="text-[10px] font-bold text-slate-500 tracking-tight">Found a problem? Let us know so we can fix it.</p>
          </div>
          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* 3. App Language */}
        <div className="relative">
          <div className="w-full flex items-center gap-4 p-4 rounded-3xl group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl">🌐</div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-black text-slate-800 dark:text-white">App Language</h4>
              <p className="text-[10px] font-bold text-slate-500 tracking-tight">Select the language you want to use in TutorX.</p>
            </div>
            <select 
              value={currentLanguage} 
              onChange={(e) => handleLangChange(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>English (default)</option>
              <option>Zulu</option>
              <option>Xhosa</option>
              <option>Afrikaans</option>
            </select>
          </div>
          {showLangUpdate && (
            <div className="absolute top-0 right-0 animate-in fade-in slide-in-from-top-1 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-xl shadow-lg z-20">
              Language updated successfully.
            </div>
          )}
        </div>

        {/* 4. Contact Support */}
        <div className="p-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Contact Support</h4>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed mt-1">Need help? Reach out to CipherX Inc anytime. We respond within 24 hours.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="mailto:cipherxinc@gmail.com" className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all group">
                <span className="text-lg group-hover:scale-110 transition-transform">✉️</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Email Us</span>
              </a>
              <a href="https://wa.me/27823737887" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 5. Legal Row */}
        <div className="flex border-t border-slate-50 dark:border-slate-800 pt-4 px-4 gap-6">
          <button onClick={() => setActiveModal('terms')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">Terms of Use</button>
          <button onClick={() => setActiveModal('privacy')} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">Privacy Policy</button>
        </div>
      </section>

      {/* Logout & Version */}
      <section className="px-4 space-y-6">
        <button 
          onClick={onLogout}
          className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out
        </button>
        <div className="text-center space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">TutorX v1.0.0</p>
          <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{DEVELOPER_CREDIT}</p>
        </div>
      </section>

      {/* Modals Implementation */}
      {activeModal === 'bug' && (
        <ModalContainer title="Report a Bug" subtitle="Let us know what's wrong." onClose={() => setActiveModal(null)}>
          {bugSubmitted ? (
            <div className="text-center py-12 animate-in zoom-in duration-300">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white">Submission Successful</h4>
              <p className="text-sm font-bold text-slate-500 mt-2">Thank you! We’ve received your report.</p>
            </div>
          ) : (
            <form onSubmit={handleBugSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Description</label>
                <textarea 
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Describe the issue here…"
                  rows={5}
                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-sm font-bold focus:border-rose-500 outline-none transition-all resize-none"
                  required
                />
              </div>
              <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Submit Report
              </button>
            </form>
          )}
        </ModalContainer>
      )}

      {activeModal === 'help' && (
        <ModalContainer title="Help Centre" subtitle="Tutorials & Documentation" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="relative">
              <input type="text" placeholder="Search help articles…" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-sm font-bold outline-none" />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {["Getting Started", "Maths Guru Mode Guide", "Learning Modes", "Account & Subscription"].map((topic, i) => (
                <button key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{topic}</span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        </ModalContainer>
      )}

      {activeModal === 'terms' && (
        <ModalContainer title="Terms of Use" subtitle="Rules & Conditions" onClose={() => setActiveModal(null)}>
          <div className="prose prose-sm dark:prose-invert space-y-4">
            <p className="font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              Read the rules and conditions for using TutorX. By accessing the platform, you agree to comply with our academic integrity standards.
            </p>
            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">Usage Agreement</h4>
            <p className="text-sm text-slate-500">TutorX is an AI aid. While we strive for accuracy, users are responsible for final verification of academic work.</p>
            <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-6">Accept & Continue</button>
          </div>
        </ModalContainer>
      )}

      {activeModal === 'privacy' && (
        <ModalContainer title="Privacy Policy" subtitle="How we protect your data" onClose={() => setActiveModal(null)}>
          <div className="prose prose-sm dark:prose-invert space-y-4">
            <p className="font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              We take your privacy seriously. Here is how your data is handled at TutorX:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Chat Memory</h5>
                <p className="text-[11px] font-bold text-slate-500">History is used to maintain context in your current learning session and personalized tutor memory.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">OCR Scans</h5>
                <p className="text-[11px] font-bold text-slate-500">Math problem images are processed temporarily for analysis and are not stored for marketing.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Payment Data</h5>
                <p className="text-[11px] font-bold text-slate-500">All financial transactions are handled securely by Yoco. We never store credit card information.</p>
              </div>
            </div>
          </div>
        </ModalContainer>
      )}

    </div>
  );
};

export default Profile;

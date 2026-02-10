
import React, { useMemo, useState } from 'react';
import { UserProfile, SubscriptionTier, UserDocument } from '../types';
import { DEVELOPER_CREDIT } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpload?: (doc: UserDocument) => void;
  onTriggerUpgrade?: (tier: SubscriptionTier) => void;
  onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpload, onTriggerUpgrade, onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const stats = useMemo(() => {
    const scores = user.quizScores || [];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length) : 0;
    return { avgScore };
  }, [user.quizScores]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user.tier === SubscriptionTier.FREE) {
      onTriggerUpgrade?.(SubscriptionTier.PREMIUM);
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const doc: UserDocument = {
        name: file.name,
        type: file.type,
        data: base64,
        date: Date.now()
      };
      onUpload?.(doc);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto pb-24">
      
      {/* Profile Identity Header */}
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

      {/* Document Repository */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Archive</h3>
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Document Analysis Vault</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className={`block relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${user.tier === SubscriptionTier.FREE ? 'border-slate-200 dark:border-slate-800 opacity-50 grayscale' : 'border-slate-100 dark:border-slate-700 hover:border-indigo-500'}`}>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,image/*"
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500">
                {isUploading ? (
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">Upload Knowledge Packet</p>
            </div>
          </label>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">About TutorX</h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">The Intelligence Engine</p>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
          TutorX is an AI-powered tutoring application designed to help students learn smarter, understand concepts clearly, and prepare effectively for exams. Developed by Cipher X Inc.
        </p>
      </section>

      {/* Explicit Logout Button at Bottom of Profile */}
      <section className="px-4">
        <button 
          onClick={onLogout}
          className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Terminate Neural Session
        </button>
        <p className="text-center mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {DEVELOPER_CREDIT}
        </p>
      </section>

    </div>
  );
};

export default Profile;

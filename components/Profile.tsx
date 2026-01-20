
import React, { useMemo, useState } from 'react';
import { UserProfile, SubscriptionTier, UserDocument } from '../types';
import { DEVELOPER_CREDIT } from '../constants';

interface ProfileProps {
  user: UserProfile;
  onUpload?: (doc: UserDocument) => void;
  onTriggerUpgrade?: (tier: SubscriptionTier) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpload, onTriggerUpgrade }) => {
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
      
      {/* 👤 Profile Identity Header */}
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

      {/* 📂 Document Repository (Premium Gated) */}
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
          {user.tier === SubscriptionTier.FREE && (
            <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest">Premium Only</span>
          )}
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
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">Upload Knowledge Packet</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">PDF, Docs, or Images for Neural Analysis</p>
              </div>
            </div>
          </label>

          <div className="grid grid-cols-1 gap-3">
            {user.uploadedDocuments?.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{doc.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Analyze</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 👤 ABOUT TUTORX SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">About TutorX</h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">The Intelligence Engine</p>
          </div>
        </div>

        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
          <p>
            TutorX is an AI-powered tutoring application designed to help students learn smarter, understand concepts clearly, and prepare effectively for exams.
          </p>
          <p>
            TutorX focuses on explanation, guidance, and learning clarity, not just answers. It assists students with homework, exam preparation, and concept breakdown across multiple subjects.
          </p>
          <p>
            TutorX is developed by <span className="text-indigo-600 dark:text-indigo-400 font-bold">Cipher X Inc</span>, a technology company focused on building intelligent digital solutions.
          </p>
          <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Credits</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">Founder</p>
                <p className="text-xs">Wally Nthani</p>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200">Company</p>
                <p className="text-xs">Cipher X Inc</p>
              </div>
            </div>
          </div>
          <p className="italic text-xs pt-2">
            "TutorX is continuously evolving, with new features being added to improve learning experiences for students."
          </p>
        </div>
      </section>

      {/* 👤 SUPPORT SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">TutorX Support</h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Direct Assistance Channel</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Need help or have feedback? We’re here to help.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            If you experience any issues, have questions, or want to suggest improvements, please contact our support team.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Support coverage includes:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {["Account or login issues", "App functionality questions", "Feature requests", "Bug reports", "General feedback"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 italic">
            TutorX is actively being improved, and your feedback helps shape future updates.
          </p>
        </div>

        {/* Contact Links */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Email */}
          <a href="mailto:cipherxinc@gmail.com" className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Protocol</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">cipherxinc@gmail.com</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transform transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/27823737887" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-emerald-500 transition-all group shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 7.454c-1.679 0-3.323-.451-4.766-1.305l-.341-.203-3.543.929.946-3.454-.223-.354c-.936-1.491-1.431-3.211-1.431-4.978 0-5.268 4.287-9.555 9.555-9.555 2.553 0 4.953.994 6.759 2.799s2.8 4.205 2.8 6.758c0 5.269-4.288 9.556-9.556 9.556m8.113-17.669c-2.167-2.167-5.048-3.361-8.113-3.361-6.315 0-11.455 5.14-11.455 11.455 0 2.019.526 3.99 1.524 5.728L1.5 22.5l5.241-1.375c1.673.913 3.561 1.396 5.485 1.396h.005c6.313 0 11.454-5.141 11.454-11.456 0-3.064-1.194-5.946-3.361-8.112z"/></svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">WhatsApp Protocol</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">+27 82 373 7887</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transform transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </a>

          {/* Facebook */}
          <a href="https://www.facebook.com/share/1LGV5mkfaZ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.784h-2.955v-3.427h2.955v-2.527c0-2.925 1.787-4.516 4.396-4.516 1.25 0 2.324.093 2.637.135v3.058l-1.81.001c-1.42 0-1.694.675-1.694 1.664v2.189h3.385l-.441 3.427h-2.944v8.784h6.113c.733 0 1.326-.593 1.326-1.324v-21.351c0-.732-.593-1.325-1.326-1.325z"/></svg>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Facebook Community</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">TutorX Official Page</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transform transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        {/* Footer Credit */}
        <div className="pt-8 text-center space-y-3 border-t border-slate-50 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Developed by Cipher X Inc</p>
          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-400">Founder: Wally Nthani</p>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest pt-2">Thank you for using TutorX</p>
        </div>
      </section>

    </div>
  );
};

export default Profile;

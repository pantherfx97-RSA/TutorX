
import React, { useState, useMemo } from 'react';
import { DifficultyLevel, UserProfile, SubscriptionTier, TutorMode } from '../types';

interface DashboardProps {
  user: UserProfile;
  onStartLearning: (topic: string, level: DifficultyLevel, academicLevel: string, examType: string, mode: TutorMode) => void;
  onTriggerUpgrade: (tier: SubscriptionTier) => void;
  loading: boolean;
}

const MODES: { id: TutorMode; label: string; icon: string; desc: string; recommended?: boolean }[] = [
  { id: 'auto', label: 'Auto', icon: '🤖', desc: 'Smart auto-adjust logic.', recommended: true },
  { id: 'university', label: 'University', icon: '🎓', desc: 'Deep academic theory.' },
  { id: 'eli10', label: 'ELI10', icon: '👶', desc: "Explain like I'm 10." },
  { id: 'exam', label: 'Exam Mode', icon: '📚', desc: 'Strict test preparation.' },
  { id: 'slow', label: 'Slow Learner', icon: '🧠', desc: 'Patient, step-by-step.' },
  { id: 'quick', label: 'Quick Revision', icon: '⚡', desc: 'Fast facts and formulas.' },
  { id: 'general', label: 'General', icon: '🤝', desc: 'Casual conversational.' },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onStartLearning, onTriggerUpgrade, loading }) => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  const [academicLevel, setAcademicLevel] = useState<'High School' | 'University'>('High School');
  const [examType, setExamType] = useState('');
  const [selectedMode, setSelectedMode] = useState<TutorMode>('auto');

  const analytics = useMemo(() => {
    const scores = user.quizScores || [];
    const domainCounts: Record<string, number> = { Tech: 0, Science: 0, Arts: 0, Other: 0 };
    user.completedTopics.forEach(t => {
      const lower = t.toLowerCase();
      if (lower.match(/ai|code|data|web|software|crypto|tech|engine/)) domainCounts.Tech++;
      else if (lower.match(/bio|chem|phys|math|science|space|quantum/)) domainCounts.Science++;
      else if (lower.match(/art|music|paint|jazz|history|philosophy|literature/)) domainCounts.Arts++;
      else domainCounts.Other++;
    });
    return { domainCounts };
  }, [user.completedTopics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || loading) return;
    onStartLearning(subject, difficulty, academicLevel, examType, selectedMode);
  };

  const isLevelLocked = (lv: DifficultyLevel) => {
    if (lv === DifficultyLevel.INTERMEDIATE && user.tier === SubscriptionTier.FREE) return true;
    if (lv === DifficultyLevel.ADVANCED && user.tier !== SubscriptionTier.PRO) return true;
    return false;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full pb-20">
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-slate-50 leading-tight tracking-tight">
              Protocol <span className="text-indigo-600 dark:text-indigo-400">Active</span>
            </h2>
            <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-[9px] font-black tracking-[0.2em] shadow-lg uppercase border border-white/20">
              {user.tier} Clearance
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Biology..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:border-indigo-500 outline-none transition-all text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Exam Focus</label>
                <input
                  type="text"
                  placeholder="e.g. NSC, IGCSE, Finals..."
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:border-indigo-500 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* NEURAL MODE SELECTOR */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 ml-1">Choose Learning Mode</label>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id)}
                    className={`flex-shrink-0 w-32 p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-2 group active:scale-95 ${
                      selectedMode === m.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{m.label}</span>
                    {m.recommended && <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${selectedMode === m.id ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white animate-pulse'}`}>Recommended</span>}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-500 text-center italic">
                {MODES.find(m => m.id === selectedMode)?.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Academic Level</label>
                  <div className="flex p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setAcademicLevel('High School')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${academicLevel === 'High School' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>High School</button>
                    <button type="button" onClick={() => setAcademicLevel('University')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${academicLevel === 'University' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>University</button>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Complexity Mode</label>
                  <div className="flex gap-2">
                    {Object.values(DifficultyLevel).map((lv) => (
                      <button key={lv} type="button" onClick={() => isLevelLocked(lv) ? onTriggerUpgrade(lv === DifficultyLevel.ADVANCED ? SubscriptionTier.PRO : SubscriptionTier.PREMIUM) : setDifficulty(lv)} className={`flex-1 py-2 rounded-xl border font-black text-[9px] transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest ${difficulty === lv ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400'}`}>
                        {lv === DifficultyLevel.BEGINNER ? "Easy" : lv === DifficultyLevel.INTERMEDIATE ? "Mid" : "Pro"}
                        {isLevelLocked(lv) && <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading || !subject.trim()}
              className={`w-full py-5 rounded-[2rem] text-white font-black text-sm shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.4em] ${loading || !subject.trim() ? 'bg-slate-300 dark:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Curate Masterclass</>}
            </button>
          </form>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400 mb-8">Subject Matrix</h3>
          <div className="flex-1 space-y-6">
            {Object.entries(analytics.domainCounts).map(([domain, count]) => (
              <div key={domain} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="text-slate-500">{domain} Domain</span><span className="text-slate-900 dark:text-slate-100">{count} Records</span></div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-[1s]" style={{ width: `${Math.max(Number(count) * 10, 5)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-slate-800">
           <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-6">Neural Archive</h3>
           <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar max-h-[400px]">
              {user.quizScores.slice().reverse().map((score, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                   <p className="text-[11px] font-black text-white leading-tight mb-1 truncate">{score.topic}</p>
                   <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-500">{new Date(score.date).toLocaleDateString()}</span><span className="text-[10px] font-black text-indigo-300">{score.score}%</span></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

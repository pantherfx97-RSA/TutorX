
import React, { useState, useMemo } from 'react';
import { DifficultyLevel, UserProfile, SubscriptionTier, QuizScoreRecord } from '../types';

interface DashboardProps {
  user: UserProfile;
  onStartLearning: (topic: string, level: DifficultyLevel) => void;
  onTriggerUpgrade: (tier: SubscriptionTier) => void;
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartLearning, onTriggerUpgrade, loading }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);

  // Recommendation Engine Logic
  const recommendations = useMemo(() => {
    const techPool = ["Fullstack Web Development", "Neural Networks", "Blockchain Fundamentals", "Cybersecurity Strategy", "Cloud Architecture"];
    const sciencePool = ["Quantum Mechanics", "Molecular Biology", "Astrophysics", "Organic Chemistry", "Genetic Engineering"];
    const artsPool = ["Modern Philosophy", "Renaissance Art", "Music Theory", "Creative Writing", "History of Cinema"];
    const defaultPool = ["Psychology of Learning", "Public Speaking", "Macroeconomics", "Critical Thinking"];

    const lowerTopics = user.completedTopics.map(t => t.toLowerCase());
    
    // Determine dominant domain
    const counts = { Tech: 0, Science: 0, Arts: 0 };
    lowerTopics.forEach(t => {
      if (t.match(/ai|code|data|web|software|crypto|tech|engine|dev/)) counts.Tech++;
      else if (t.match(/bio|chem|phys|math|science|space|quantum|astro/)) counts.Science++;
      else if (t.match(/art|music|paint|jazz|history|philosophy|literature|film/)) counts.Arts++;
    });

    let suggested: string[] = [];
    if (counts.Tech >= counts.Science && counts.Tech >= counts.Arts) suggested = techPool;
    else if (counts.Science >= counts.Tech && counts.Science >= counts.Arts) suggested = sciencePool;
    else if (counts.Arts >= counts.Tech && counts.Arts >= counts.Science) suggested = artsPool;
    else suggested = defaultPool;

    // Filter out already completed ones and return top 4
    return suggested.filter(s => !lowerTopics.includes(s.toLowerCase())).slice(0, 4);
  }, [user.completedTopics]);

  // Analytics & Matrix Logic
  const analytics = useMemo(() => {
    const scores = user.quizScores || [];
    const recentScores = scores.slice(-7);
    
    const domainCounts: Record<string, number> = { Tech: 0, Science: 0, Arts: 0, Other: 0 };
    user.completedTopics.forEach(t => {
      const lower = t.toLowerCase();
      if (lower.match(/ai|code|data|web|software|crypto|tech|engine/)) domainCounts.Tech++;
      else if (lower.match(/bio|chem|phys|math|science|space|quantum/)) domainCounts.Science++;
      else if (lower.match(/art|music|paint|jazz|history|philosophy|literature/)) domainCounts.Arts++;
      else domainCounts.Other++;
    });

    return { recentScores, domainCounts };
  }, [user.quizScores, user.completedTopics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    onStartLearning(topic, level);
  };

  const handleRecommendationClick = (rec: string) => {
    setTopic(rec);
    // Smooth scroll to top of search hero
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLevelLocked = (lv: DifficultyLevel) => {
    if (lv === DifficultyLevel.INTERMEDIATE && user.tier === SubscriptionTier.FREE) return true;
    if (lv === DifficultyLevel.ADVANCED && user.tier !== SubscriptionTier.PRO) return true;
    return false;
  };

  const handleLevelClick = (lv: DifficultyLevel) => {
    if (lv === DifficultyLevel.INTERMEDIATE && user.tier === SubscriptionTier.FREE) {
      onTriggerUpgrade(SubscriptionTier.PREMIUM);
      return;
    }
    if (lv === DifficultyLevel.ADVANCED && user.tier !== SubscriptionTier.PRO) {
      onTriggerUpgrade(SubscriptionTier.PRO);
      return;
    }
    setLevel(lv);
  };

  const getLevelLabel = (lv: DifficultyLevel) => {
    if (lv === DifficultyLevel.BEGINNER) return "Easy Mode";
    if (lv === DifficultyLevel.INTERMEDIATE) return "In-Depth";
    return "Exam-Ready";
  };

  const PerformanceSparkline = () => {
    const data = analytics.recentScores.map(s => s.score);
    if (data.length < 2) return (
      <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Awaiting Data Packets</p>
      </div>
    );
    
    const width = 200;
    const height = 60;
    const padding = 5;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((d / 100) * (height - padding * 2) + padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d={`M ${points}`} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        {data.map((d, i) => {
           const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
           const y = height - ((d / 100) * (height - padding * 2) + padding);
           return <circle key={i} cx={x} cy={y} r="4" className="fill-white dark:fill-slate-900 stroke-indigo-500 stroke-2" />;
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full pb-20">
      {/* Search & Difficulty Hero */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-slate-50 leading-tight tracking-tight">
              Protocol <span className="text-indigo-600 dark:text-indigo-400">Active</span>
            </h2>
            {user.tier !== SubscriptionTier.FREE && (
              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-[9px] font-black tracking-[0.2em] shadow-lg animate-success-pop uppercase border border-white/20">
                {user.tier} Clearance
              </div>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium">Initialize learning sequence for your next domain.</p>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Curation Objective</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Quantum Computing, Behavioral Economics..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base shadow-inner font-semibold"
                  required
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {Object.values(DifficultyLevel).map((lv) => {
                const locked = isLevelLocked(lv);
                const isActive = level === lv;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => handleLevelClick(lv)}
                    className={`flex-1 py-4.5 px-4 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest ${
                      isActive 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {getLevelLabel(lv)}
                    {locked && (
                      <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className={`w-full py-5 sm:py-6 rounded-[2rem] text-white font-black text-sm sm:text-base shadow-2xl transition-all active:scale-[0.98] flex flex-col items-center justify-center relative group overflow-hidden ${
                loading || !topic.trim() ? 'bg-slate-300 dark:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="uppercase tracking-[0.3em] font-black">Syncing Core...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 uppercase tracking-[0.4em]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 
                   Curate Masterclass
                </div>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Smart Recommendations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Smart Recommendations</h3>
           <span className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
             Neural Pulse Active
           </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((rec, i) => (
            <button
              key={i}
              onClick={() => handleRecommendationClick(rec)}
              className="group p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-left hover:border-indigo-500 hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500">Rec-0{i+1}</span>
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{rec}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Neural Activity Archive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Domain Matrix Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col group transition-all hover:shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">Subject Matrix</h3>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Domain Distribution</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {Object.entries(analytics.domainCounts).map(([domain, count]) => {
              const percentage = user.completedTopics.length > 0 ? (Number(count) / user.completedTopics.length) * 100 : 0;
              const colorClass = domain === 'Tech' ? 'bg-indigo-500' : domain === 'Science' ? 'bg-emerald-500' : domain === 'Arts' ? 'bg-purple-500' : 'bg-slate-400';
              
              return (
                <div key={domain} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-slate-500">{domain} Domain</span>
                    <span className="text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{count} Records</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full ${colorClass} rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_12px_rgba(0,0,0,0.1)] relative`} 
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Velocity</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{(user.completedTopics.length / Math.max(user.streak, 1)).toFixed(1)} <span className="text-[10px] uppercase font-bold text-slate-400 tracking-normal">units/day</span></p>
            </div>
            <div className="h-10 w-[120px]">
               <PerformanceSparkline />
            </div>
          </div>
        </div>

        {/* Neural Activity Archive Log */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col h-full border border-slate-800">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Neural Archive</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar max-h-[400px]">
              {user.quizScores.length === 0 && (
                <div className="text-center py-20 opacity-20">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">System Idling...<br/>Awaiting Neural Input</p>
                </div>
              )}
              {user.quizScores.slice().reverse().map((score, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 animate-in slide-in-from-right-2 duration-300">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Entry #{user.quizScores.length - i}</span>
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Synced</span>
                   </div>
                   <p className="text-[11px] font-black text-white leading-tight mb-1 truncate">{score.topic}</p>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500">{new Date(score.date).toLocaleDateString()}</span>
                      <span className="text-[10px] font-black text-indigo-300">{score.score}% Score</span>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">Secure Knowledge Ledger v1.2</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

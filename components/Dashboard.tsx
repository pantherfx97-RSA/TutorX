
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

  // Analytics Helpers
  const analytics = useMemo(() => {
    const scores = user.quizScores || [];
    const recentScores = scores.slice(-7);
    
    // Domain classifier (simple keyword match for demo)
    const domainCounts: Record<string, number> = { Tech: 0, Science: 0, Arts: 0, Other: 0 };
    user.completedTopics.forEach(t => {
      const lower = t.toLowerCase();
      if (lower.match(/ai|code|data|web|software|crypto|tech/)) domainCounts.Tech++;
      else if (lower.match(/bio|chem|phys|math|science|space/)) domainCounts.Science++;
      else if (lower.match(/art|music|paint|jazz|history|philosophy/)) domainCounts.Arts++;
      else domainCounts.Other++;
    });

    return { recentScores, domainCounts };
  }, [user.quizScores, user.completedTopics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    if (level === DifficultyLevel.INTERMEDIATE && user.tier === SubscriptionTier.FREE) {
      onTriggerUpgrade(SubscriptionTier.PREMIUM);
      return;
    }
    if (level === DifficultyLevel.ADVANCED && user.tier !== SubscriptionTier.PRO) {
      onTriggerUpgrade(SubscriptionTier.PRO);
      return;
    }

    onStartLearning(topic, level);
  };

  const isLevelLocked = (lv: DifficultyLevel) => {
    if (lv === DifficultyLevel.INTERMEDIATE && user.tier === SubscriptionTier.FREE) return true;
    if (lv === DifficultyLevel.ADVANCED && user.tier !== SubscriptionTier.PRO) return true;
    return false;
  };

  // SVG Sparkline Component
  const PerformanceSparkline = () => {
    const data = analytics.recentScores.map(s => s.score);
    if (data.length < 2) return <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">More data needed</div>;
    
    const width = 200;
    const height = 60;
    const padding = 5;
    const points = data.map((d, i) => {
      // Fixed: Explicitly ensure operands are numbers to avoid arithmetic type errors
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((d / 100) * (height - padding * 2) + padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={`M ${points}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 drop-shadow-lg" />
        {data.map((d, i) => {
           const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
           const y = height - ((d / 100) * (height - padding * 2) + padding);
           return <circle key={i} cx={x} cy={y} r="3" className="fill-white stroke-indigo-500 stroke-2" />;
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      {/* Welcome Hero */}
      <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all">
        {user.tier !== SubscriptionTier.FREE && (
          <div className="absolute top-4 right-6 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest shadow-lg animate-success-pop uppercase">
            {user.tier} Access
          </div>
        )}
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-slate-50 leading-tight">
            Hello, <span className="text-indigo-600 dark:text-indigo-400">{user.email.split('@')[0]}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">Ready to unlock your next masterclass?</p>
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="relative">
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Learning Objective</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask for any topic... (e.g. AI Strategy, Physics, Jazz History)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base shadow-inner"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {Object.values(DifficultyLevel).map((lv) => {
                const locked = isLevelLocked(lv);
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevel(lv)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      level === lv 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {lv}
                    {locked && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className={`w-full py-4 sm:py-5 rounded-[1.5rem] text-white font-black text-base sm:text-lg shadow-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center ${
                loading || !topic.trim() ? 'bg-slate-300 dark:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Generating Expert Class...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 uppercase tracking-widest text-sm">
                   {isLevelLocked(level) ? <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg> Unlock Full Tier</> : <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Curate Lesson</>}
                </div>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Advanced Learning Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Activity & Trend Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between group transition-all hover:shadow-lg">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-slate-500">Learning Velocity</h3>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Live Metrics</span>
              </div>
            </div>
            
            <div className="h-24 mb-4">
              <PerformanceSparkline />
            </div>
          </div>
          
          <div className="flex items-end justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Trend</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {analytics.recentScores.length > 0 
                  ? Math.round(analytics.recentScores.reduce((acc, s) => acc + s.score, 0) / analytics.recentScores.length)
                  : 0}% <span className="text-xs text-slate-400 font-medium tracking-normal">avg</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{user.completedTopics.length}</p>
            </div>
          </div>
        </div>

        {/* Subject Domain Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col group transition-all hover:shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-widest text-slate-500">Domain Distribution</h3>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          </div>

          <div className="flex-1 space-y-4">
            {Object.entries(analytics.domainCounts).map(([domain, count]) => {
              const percentage = user.completedTopics.length > 0 ? (count / user.completedTopics.length) * 100 : 0;
              const colorClass = domain === 'Tech' ? 'bg-indigo-500' : domain === 'Science' ? 'bg-emerald-500' : domain === 'Arts' ? 'bg-amber-500' : 'bg-slate-400';
              
              return (
                <div key={domain} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-600 dark:text-slate-400">{domain}</span>
                    <span className="text-slate-900 dark:text-slate-100">{count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
             {/* Fixed: Add explicit type casting for arithmetic operation in sort callback to resolve TS error */}
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Most Explored: <span className="text-indigo-600 dark:text-indigo-400 font-black">{Object.entries(analytics.domainCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'None'}</span></p>
          </div>
        </div>
      </div>

      {/* Streak Booster (Only for Free users) */}
      {user.tier === SubscriptionTier.FREE && (
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="relative z-10 max-w-sm">
            <h3 className="text-2xl font-black mb-3">Accelerate Your Mastery</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-6 opacity-90">Unlock timed exams, advanced analytics history, and direct AI-voice feedback by upgrading to Premium.</p>
            <button 
              onClick={() => onTriggerUpgrade(SubscriptionTier.PREMIUM)}
              className="px-8 py-3 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl active:scale-[0.98]"
            >
              Explore Tiers
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;


import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { DEVELOPER_CREDIT, APP_NAME } from '../constants';

interface ProfileProps {
  user: UserProfile;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  // Aggregate Analytics
  const stats = useMemo(() => {
    const scores = user.quizScores || [];
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length) : 0;
    const bestTopic = scores.length > 0 ? [...scores].sort((a,b) => b.score - a.score)[0] : null;
    
    return { avgScore, bestTopic };
  }, [user.quizScores]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
      {/* Premium Profile Header */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-all group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        
        <div className="relative mt-12 px-8 pb-8 flex flex-col items-center">
          <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[2rem] p-1.5 shadow-2xl relative transform transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-5xl font-black text-indigo-600 dark:text-indigo-400">
              {user.email[0].toUpperCase()}
            </div>
            {user.streak > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-2 rounded-xl shadow-lg animate-bounce duration-1000">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-50">{user.email}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{user.tier} Tier</span>
              {user.streak > 1 && <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">{user.streak} Day Streak</span>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 w-full">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{user.completedTopics.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lessons</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.avgScore}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Score</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{user.learningProgress}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mastery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Analytics Breakdown */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            Mastery Analytics
          </h3>
          
          <div className="space-y-6">
            {/* Top Subject Highlight */}
            {stats.bestTopic && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Star Pupil Domain</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{stats.bestTopic.topic}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.bestTopic.score}%</p>
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Top Performance</p>
                </div>
              </div>
            )}

            {/* Achievement Timeline Visual */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Milestones</p>
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-100 dark:border-slate-800 ml-1">
                {user.quizScores.slice(-3).reverse().map((record, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{record.topic}</p>
                        <p className="text-[10px] font-medium text-slate-400">{new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {record.difficulty}</p>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${record.score >= 80 ? 'text-emerald-600 bg-emerald-50' : record.score >= 50 ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 bg-slate-50'}`}>
                        {record.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 italic leading-relaxed uppercase tracking-wider text-center">
            {DEVELOPER_CREDIT}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Profile;

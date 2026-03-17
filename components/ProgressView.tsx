import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Brain, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  BarChart3,
  Calendar,
  Flame,
  Trophy
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { UserProfile } from '../types';

interface ProgressViewProps {
  profile: UserProfile;
}

const ProgressView: React.FC<ProgressViewProps> = ({ profile }) => {
  const activityData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 4.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 5.1 },
    { day: 'Fri', hours: 2.9 },
    { day: 'Sat', hours: 6.4 },
    { day: 'Sun', hours: 4.5 },
  ];

  const subjectPerformance = [
    { subject: 'Math', score: 85, color: '#10b981' },
    { subject: 'Science', score: 72, color: '#8b5cf6' },
    { subject: 'English', score: 94, color: '#f59e0b' },
    { subject: 'History', score: 68, color: '#ef4444' },
  ];

  const stats = [
    { label: 'Learning Streak', value: '12 Days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Total Hours', value: '148h', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Mastery Level', value: 'Advanced', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Quizzes Passed', value: '42', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
              <TrendingUp size={12} />
              Neural Analytics
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Your Progress</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2">
              <Calendar size={18} />
              Last 7 Days
            </button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 space-y-4 hover:bg-slate-900 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight">Learning Activity</h3>
                <p className="text-slate-500 text-sm font-medium">Daily study hours across the week</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <TrendingUp size={16} />
                +12% from last week
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Mastery */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">Subject Mastery</h3>
              <p className="text-slate-500 text-sm font-medium">Performance by category</p>
            </div>

            <div className="space-y-6">
              {subjectPerformance.map((sub) => (
                <div key={sub.subject} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-300">{sub.subject}</span>
                    <span className="text-sm font-black text-white">{sub.score}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5">
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                View Detailed Mastery <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="text-amber-400" />
              Recent Achievements
            </h2>
            <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              View All Awards
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Fast Learner', desc: 'Completed 5 lessons in one day', icon: Zap, color: 'text-yellow-400' },
              { title: 'Quiz Master', desc: 'Scored 100% on 10 consecutive quizzes', icon: Award, color: 'text-indigo-400' },
              { title: 'Night Owl', desc: 'Studied for 3 hours after midnight', icon: Brain, color: 'text-purple-400' },
            ].map((award) => (
              <div key={award.title} className="flex items-center gap-6 p-6 bg-slate-900/50 border border-white/5 rounded-[2rem] hover:bg-slate-900 transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${award.color} shrink-0`}>
                  <award.icon size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black tracking-tight">{award.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{award.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;

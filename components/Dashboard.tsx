import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Zap, 
  ArrowRight, 
  Clock,
  TrendingUp,
  Target,
  Mic,
  Image as ImageIcon,
  Award,
  Bookmark
} from 'lucide-react';
import { UserProfile } from '../types';
import { TOPICS } from '../constants';

interface DashboardProps {
  profile: UserProfile;
  onSelectTopic: (topic: string) => void;
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, onSelectTopic, onViewChange }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const suggestedPrompts = [
    "Explain Quantum Physics",
    "Solve x² + 5x + 6 = 0",
    "Quiz me on History",
    "Create a study plan for SAT"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectTopic(searchQuery);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20 px-6 md:px-12 lg:px-20 pt-10"
    >
      {/* Neural Search Hero */}
      <motion.div 
        variants={itemVariants}
        className="relative py-16 md:py-24 px-8 md:px-12 bg-slate-900 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-purple-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/10"
          >
            <Brain size={14} className="animate-pulse" />
            Neural Engine Active
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 font-display leading-[0.9]"
          >
            What shall we <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">evolve</span> today?
          </motion.h1>
          
          <motion.form 
            onSubmit={handleSearch}
            className="relative mb-12 group max-w-2xl mx-auto"
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a concept, problem, or topic..."
                className="w-full px-10 py-7 bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-white/10 rounded-[2rem] outline-none transition-all text-white font-medium placeholder:text-slate-600 shadow-2xl text-xl backdrop-blur-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <button 
                  type="button"
                  className="p-3 text-slate-500 hover:text-white transition-colors"
                  title="Voice Input"
                >
                  <Mic size={24} />
                </button>
                <button 
                  type="submit"
                  className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/40 active:scale-95 group/btn"
                >
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-4">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSelectTopic(prompt)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 text-sm font-bold transition-all hover:text-white hover:border-indigo-500/30"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Welcome Header */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-10"
      >
        <div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white font-display">
            Hello, {profile.fullName.split(' ')[0]}
          </h2>
          <p className="text-slate-500 font-medium text-xl md:text-2xl mt-4">
            Your cognitive metrics are looking strong today.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-5 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
              <Zap size={28} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Streak</p>
              <p className="text-3xl font-black text-white">{profile.streak} Days</p>
            </div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-5 backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Progress</p>
              <p className="text-3xl font-black text-white">{profile.learningProgress}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-8 border border-indigo-500/20">
              <Brain size={28} />
            </div>
            <h3 className="text-3xl font-black mb-3 font-display">Neural Progress</h3>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">You're in the top 15% of learners this week.</p>
            <div className="w-full bg-white/5 rounded-full h-3 mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${profile.learningProgress}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Level 4 Engine</p>
              <button 
                onClick={() => onViewChange('Progress')} 
                className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5"
              >
                Full Analytics
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
        </div>

        <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-white/5 shadow-2xl backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mb-8 group-hover:text-white transition-colors">
            <Clock size={28} />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 font-display">Time Invested</h3>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">12.5 hours of deep learning completed.</p>
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
            <TrendingUp size={20} />
            <span>+24% from last week</span>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-[3rem] p-10 border border-white/5 shadow-2xl backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mb-8 group-hover:text-white transition-colors">
            <Target size={28} />
          </div>
          <h3 className="text-3xl font-black text-white mb-3 font-display">Daily Goal</h3>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">Complete 2 more lessons to hit your goal.</p>
          <button className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-indigo-300 transition-colors">
            Adjust Parameters
          </button>
        </div>
      </motion.div>

      {/* Bookmarks Section */}
      {profile.bookmarkedLessons && profile.bookmarkedLessons.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-4 font-display">
              <Bookmark className="text-indigo-500" size={32} fill="currentColor" />
              Bookmarked Lessons
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {profile.bookmarkedLessons.map((bookmark) => (
              <motion.button
                key={bookmark.topic}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => onSelectTopic(bookmark.topic)}
                className="group bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl hover:border-indigo-500/30 transition-all text-left relative overflow-hidden backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 border border-indigo-500/20">
                    <BookOpen size={32} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    {bookmark.difficulty}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 font-display">{bookmark.topic}</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">Saved on {new Date(bookmark.date).toLocaleDateString()}</p>
                <div className="flex items-center text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-indigo-300 transition-colors">
                  Continue Reading <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Explore Topics */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-black tracking-tight text-white font-display">Explore Neural Paths</h2>
          <button className="text-slate-500 font-bold text-sm hover:text-white transition-colors uppercase tracking-[0.2em]">View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOPICS.map((topic) => (
            <motion.button
              key={topic}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => onSelectTopic(topic)}
              className="group bg-slate-900/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl hover:border-indigo-500/30 transition-all text-left relative overflow-hidden backdrop-blur-xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 flex items-center justify-center mb-8 transition-all duration-500 border border-white/5 group-hover:border-indigo-500/20">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 font-display">{topic}</h3>
              <p className="text-slate-500 text-base mb-8 font-medium leading-relaxed">Master the core principles of {topic.toLowerCase()} with neural guidance.</p>
              <div className="flex items-center text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] group-hover:text-indigo-300 transition-colors">
                Initialize Path <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

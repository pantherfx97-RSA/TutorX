import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  GraduationCap, 
  Zap, 
  Play, 
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft,
  BookMarked,
  Layers,
  Star
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';

interface Masterclass {
  id: string;
  title: string;
  subject: string;
  level: string;
  duration: string;
  lessons: number;
  rating: number;
  image: string;
  description: string;
  curriculum: { title: string; duration: string }[];
}

import { UserProfile } from '../types';

interface MasterclassesViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const MasterclassesView: React.FC<MasterclassesViewProps> = ({ profile, onUpdateProfile }) => {
  const [selectedClass, setSelectedClass] = useState<Masterclass | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedClass, setGeneratedClass] = useState<any>(null);

  const masterclasses: Masterclass[] = [
    {
      id: '1',
      title: 'Advanced Quantum Mechanics',
      subject: 'Physics',
      level: 'University',
      duration: '12h 45m',
      lessons: 24,
      rating: 4.9,
      image: 'https://picsum.photos/seed/quantum/800/600',
      description: 'Master the principles of quantum mechanics, from wave functions to entanglement.',
      curriculum: [
        { title: 'Introduction to Wave Mechanics', duration: '45m' },
        { title: 'The Schrödinger Equation', duration: '1h 20m' },
        { title: 'Quantum Tunneling & Applications', duration: '55m' },
      ]
    },
    {
      id: '2',
      title: 'Neural Networks & Deep Learning',
      subject: 'Computer Science',
      level: 'Advanced',
      duration: '18h 20m',
      lessons: 32,
      rating: 4.8,
      image: 'https://picsum.photos/seed/neural/800/600',
      description: 'Build and train deep neural networks using modern architectures.',
      curriculum: [
        { title: 'Foundations of Neural Networks', duration: '1h 10m' },
        { title: 'Backpropagation Explained', duration: '1h 45m' },
        { title: 'Convolutional Neural Networks', duration: '2h 15m' },
      ]
    },
    {
      id: '3',
      title: 'Mastering Organic Chemistry',
      subject: 'Chemistry',
      level: 'High School / University',
      duration: '15h 10m',
      lessons: 28,
      rating: 4.7,
      image: 'https://picsum.photos/seed/chemistry/800/600',
      description: 'A comprehensive guide to carbon-based compounds and reactions.',
      curriculum: [
        { title: 'Structure and Bonding', duration: '1h 05m' },
        { title: 'Alkanes and Cycloalkanes', duration: '1h 30m' },
        { title: 'Stereochemistry', duration: '2h 00m' },
      ]
    }
  ];

  const handleGenerateMasterclass = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await geminiService.generateMasterclass(searchQuery, 'University', 'General');
      setGeneratedClass(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-12">
      <AnimatePresence mode="wait">
        {!selectedClass && !generatedClass ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto space-y-12"
          >
            {/* Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden bg-indigo-600 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-indigo-500/20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
                  <Sparkles size={14} className="text-amber-400" />
                  AI-Powered Curation
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Neural Masterclasses
                </h1>
                <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Generate a structured, high-end curriculum on any subject in seconds. Powered by TutorX Neural Core.
                </p>
                
                <div className="relative max-w-2xl">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What do you want to master? (e.g. Quantum Physics, SAT Math)"
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-5 pl-6 pr-32 outline-none focus:bg-white/20 transition-all font-bold placeholder:text-indigo-200"
                  />
                  <button 
                    onClick={handleGenerateMasterclass}
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2"
                  >
                    {loading ? <Zap size={16} className="animate-spin" /> : <Zap size={16} />}
                    Generate
                  </button>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-64 h-80 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl flex flex-col p-6"
                >
                  <div className="w-full h-32 bg-indigo-500/30 rounded-2xl mb-4 overflow-hidden">
                    <img src="https://picsum.photos/seed/edu/400/300" alt="Edu" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-3">
                    <div className="w-3/4 h-3 bg-white/20 rounded-full" />
                    <div className="w-full h-2 bg-white/10 rounded-full" />
                    <div className="w-full h-2 bg-white/10 rounded-full" />
                    <div className="w-1/2 h-2 bg-white/10 rounded-full" />
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div className="w-20 h-8 rounded-lg bg-white/20" />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Featured Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <BookOpen className="text-indigo-400" />
                  Featured Masterclasses
                </h2>
                <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {masterclasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    whileHover={{ y: -10 }}
                    onClick={() => setSelectedClass(cls)}
                    className="group cursor-pointer bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-slate-900 transition-all shadow-xl hover:shadow-indigo-500/10"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={cls.image} 
                        alt={cls.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                        <span className="px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                          {cls.subject}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-bold">{cls.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                        {cls.title}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium line-clamp-2">
                        {cls.description}
                      </p>
                      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{cls.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Layers size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{cls.lessons} Lessons</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : generatedClass ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-12"
          >
            <button 
              onClick={() => setGeneratedClass(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft size={20} /> Back to Library
            </button>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-xs font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                  <Sparkles size={14} />
                  AI Generated Masterclass
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">{generatedClass.title}</h1>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-12">
                <div className="prose prose-invert max-w-none prose-p:text-lg prose-p:text-slate-300 prose-headings:font-black">
                  <Markdown>{generatedClass.overview}</Markdown>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Layers className="text-indigo-400" />
                    Curriculum Breakdown
                  </h2>
                  <div className="space-y-4">
                    {generatedClass.curriculum.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-indigo-400 font-black shrink-0 border border-white/5 group-hover:border-indigo-500/30 transition-all">
                          {idx + 1}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                          <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                      <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-widest">Neural Tutor</div>
                      <div className="text-xs text-slate-500 font-bold">Verified Curriculum</div>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                    <Play size={18} fill="currentColor" />
                    Start Masterclass
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-8">
              <button 
                onClick={() => setSelectedClass(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
              >
                <ArrowLeft size={20} /> Back to Library
              </button>

              <div className="relative h-80 rounded-[3rem] overflow-hidden">
                <img src={selectedClass?.image} alt={selectedClass?.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{selectedClass?.title}</h1>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">{selectedClass?.subject}</span>
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-widest border border-white/10">{selectedClass?.level}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-black tracking-tight">About this Masterclass</h2>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  {selectedClass?.description}
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-black tracking-tight">Curriculum</h2>
                <div className="space-y-4">
                  {selectedClass?.curriculum.map((lesson, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 font-black group-hover:text-indigo-400 transition-colors">
                          {idx + 1}
                        </div>
                        <span className="font-bold group-hover:text-white transition-colors">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500">{lesson.duration}</span>
                        <Play size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-8 sticky top-8">
                <div className="space-y-4">
                  <div className="text-3xl font-black tracking-tight">Free Access</div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    This masterclass is available for free as part of your neural learning journey.
                  </p>
                </div>

                <div className="space-y-4">
                  <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3">
                    <Play size={18} fill="currentColor" />
                    Start Learning
                  </button>
                  <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3">
                    <BookMarked size={18} />
                    Save to Library
                  </button>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">What's Included</h4>
                  <ul className="space-y-3">
                    {[
                      '24 High-quality lessons',
                      'Interactive neural quizzes',
                      'Downloadable resources',
                      'Certificate of completion',
                      'Direct AI tutor support'
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterclassesView;

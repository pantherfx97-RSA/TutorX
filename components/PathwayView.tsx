import React from 'react';
import { motion } from 'motion/react';
import { 
  Map, 
  Flag, 
  Circle, 
  CheckCircle2, 
  Lock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const PathwayView: React.FC = () => {
  const steps = [
    { id: 1, title: 'Neural Foundations', status: 'completed', type: 'lesson' },
    { id: 2, title: 'Logic Gates & Circuits', status: 'current', type: 'quiz' },
    { id: 3, title: 'Advanced Algorithms', status: 'locked', type: 'lesson' },
    { id: 4, title: 'Machine Learning Basics', status: 'locked', type: 'lesson' },
    { id: 5, title: 'Final Neural Synthesis', status: 'locked', type: 'exam' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Learning Pathway</h1>
          <p className="text-slate-500 font-medium">Your personalized neural journey through Quantum Physics</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Sparkles className="text-indigo-600" size={18} />
          <span className="text-sm font-bold text-slate-700">AI Optimized</span>
        </div>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>

        <div className="space-y-8 md:space-y-12 relative z-10">
          {steps.map((step, idx) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 md:gap-8 group"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${
                step.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-100' :
                step.status === 'current' ? 'bg-indigo-600 text-white shadow-indigo-100 scale-110' :
                'bg-white text-slate-300 border-2 border-slate-100 shadow-none'
              }`}>
                {step.status === 'completed' ? <CheckCircle2 size={32} /> :
                 step.status === 'current' ? <Flag size={32} /> :
                 <Lock size={24} />}
              </div>

              <div className={`flex-1 bg-white p-6 rounded-3xl border transition-all ${
                step.status === 'current' ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Step {step.id} • {step.type}
                  </span>
                  {step.status === 'current' && (
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      In Progress
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-bold mb-4 ${step.status === 'locked' ? 'text-slate-400' : 'text-slate-900'}`}>
                  {step.title}
                </h3>
                {step.status !== 'locked' && (
                  <button className={`flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors ${
                    step.status === 'current' ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                    {step.status === 'completed' ? 'Review Lesson' : 'Start Now'}
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathwayView;

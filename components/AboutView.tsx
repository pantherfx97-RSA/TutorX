import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Rocket, Users, Heart, ChevronLeft, Zap, GraduationCap } from 'lucide-react';

const AboutView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const values = [
    {
      title: 'AI Empowerment',
      icon: Zap,
      desc: 'We believe AI can unlock human potential by providing personalized guidance to every student on Earth.'
    },
    {
      title: 'Accessibility',
      icon: Rocket,
      desc: 'Education should be borderless. We build tools that work anywhere, anytime, for anyone.'
    },
    {
      title: 'Integrity',
      icon: Heart,
      desc: 'We prioritize safety and educational accuracy above all else. Our AI is designed to be a responsible mentor.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-24">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-[2rem] bg-indigo-600 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <Brain size={48} className="text-white" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">TutorX AI</h1>
            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Helping students succeed with AI. We're building the future of cognitive development.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Sparkles size={14} />
                Our Mission
              </div>
              <h2 className="text-4xl font-black tracking-tight">Democratizing Intelligence</h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              TutorX was born from a simple idea: what if every student had a world-class tutor in their pocket? 
              <br /><br />
              We leverage the latest breakthroughs in Large Language Models to create an educational experience that adapts to you—not the other way around. Whether you're struggling with calculus or exploring the French Revolution, TutorX is here to guide you.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-black text-white">500k+</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Students</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">98%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Success Rate</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full" />
            <div className="relative bg-white/5 border border-white/10 rounded-[3rem] p-12 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <GraduationCap size={200} />
              </div>
              <div className="space-y-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Rocket size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">The Neural Core</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Our proprietary Neural Core v3.1 is specifically tuned for educational safety and step-by-step reasoning. It doesn't just give answers; it builds understanding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 font-medium">The principles that drive every line of code we write.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((val) => (
              <div key={val.title} className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6 hover:bg-white/[0.07] transition-all">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400">
                  <val.icon size={24} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold tracking-tight">{val.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-gradient-to-br from-indigo-600/10 to-violet-700/10 border border-white/5 rounded-[3rem] p-12 md:p-20 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Join the Revolution</h2>
            <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">
              We're a small team of engineers, designers, and educators based in Silicon Valley, working to change how the world learns.
            </p>
          </div>
          <button className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95">
            View Careers
          </button>
        </section>
      </div>
    </div>
  );
};

export default AboutView;

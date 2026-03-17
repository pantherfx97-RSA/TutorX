import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Shield, 
  ArrowRight, 
  Play,
  CheckCircle2,
  Globe,
  Cpu,
  XCircle
} from 'lucide-react';

import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onPrivacyClick: () => void;
  onSupportClick: () => void;
  onTermsClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onPrivacyClick, onSupportClick, onTermsClick }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <div className="bg-slate-50 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-40 md:pb-56 px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-indigo-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 md:mb-10 border border-slate-200 shadow-sm"
          >
            <Brain size={14} className="animate-pulse" />
            Neural Learning Engine v3.1
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-[9rem] font-black tracking-tighter text-slate-900 mb-8 md:mb-10 leading-[0.85] font-display"
          >
            Master <br />
            <span className="text-indigo-600">Anything.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed"
          >
            The world's first AI-native learning platform that adapts to your neural patterns in real-time.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <span className="relative z-10">Initialize Engine</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button 
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-12 py-6 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 flex items-center justify-center gap-3 shadow-sm"
            >
              <Play size={18} fill="currentColor" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-[120px]"
          />
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-[120px]"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 font-display">Neural Capabilities</h2>
              <p className="text-slate-500 font-medium text-xl leading-relaxed">Engineered for maximum cognitive retention and rapid skill acquisition.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-1 bg-indigo-600 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Brain size={32} />,
                title: "Adaptive Learning",
                desc: "Our neural engine adjusts difficulty in real-time based on your cognitive performance metrics."
              },
              {
                icon: <Cpu size={32} />,
                title: "Gemini 3.1 Pro",
                desc: "Powered by the world's most advanced reasoning model for deep conceptual clarity."
              },
              {
                icon: <Zap size={32} />,
                title: "Instant Validation",
                desc: "Get immediate feedback on assessments with detailed neural insights and corrections."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group relative overflow-hidden"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white text-indigo-600 flex items-center justify-center mb-6 md:mb-10 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 md:mb-4 font-display">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">{feature.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-3xl md:rounded-[4rem] p-8 md:p-28 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-10 border border-white/10">
                <Globe size={14} />
                Global Network
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-6 md:mb-10 leading-[0.9] font-display">
                Trusted by <br />
                <span className="text-indigo-400">50,000+</span> <br />
                Explorers.
              </h2>
              <div className="space-y-6 md:space-y-8">
                {[
                  "98% Improvement in retention",
                  "100+ Subjects mastered",
                  "Top-tier university adoption"
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-4 md:gap-5">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-slate-300">{stat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.02, rotate: -1 }}
                className="aspect-square bg-slate-800/50 backdrop-blur-xl rounded-[4rem] p-12 flex flex-col justify-center border border-white/10 shadow-2xl relative z-10"
              >
                <div className="flex gap-1 text-indigo-400 mb-10">
                  {[...Array(5)].map((_, i) => <Sparkles key={i} size={28} fill="currentColor" />)}
                </div>
                <p className="text-2xl md:text-3xl font-medium italic text-slate-200 mb-12 leading-relaxed">
                  "TutorX completely changed how I study. The AI explanations are clearer than my textbooks."
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"></div>
                  <div>
                    <p className="font-black uppercase tracking-widest text-sm">Sarah Chen</p>
                    <p className="text-slate-500 text-xs font-bold">Medical Student, Stanford</p>
                  </div>
                </div>
              </motion.div>
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-indigo-600/20 blur-[100px] rounded-full"></div>
            </div>
          </div>
          <div className="absolute -right-40 -top-40 w-[30rem] h-[30rem] bg-indigo-600 rounded-full opacity-10 blur-[150px]"></div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        onPrivacyClick={onPrivacyClick}
        onTermsClick={onTermsClick}
        onContactClick={() => {}} // Add contact logic if needed
      />

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all"
              >
                <XCircle size={24} />
              </button>
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                title="TutorX Platform Demo"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

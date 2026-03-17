import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // 3s for a truly premium feel

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[140px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[120px]" 
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Brain Icon Container with Shimmer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative w-28 h-28 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] mb-10 overflow-hidden group"
        >
          <Brain size={54} className="text-white relative z-10" />
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>

        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl font-black tracking-tighter text-white mb-3 font-display"
        >
          TutorX
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-slate-400 font-medium tracking-[0.2em] uppercase text-[10px]"
        >
          Neural Learning Environment
        </motion.p>

        {/* Loading Indicator */}
        <div className="relative w-48 h-1 bg-white/5 rounded-full mt-16 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
          />
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-16 left-0 right-0 flex flex-col items-center"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
          Powered by <span className="text-indigo-400">cipherX Inc Neural Engine</span>
        </p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;

import React from 'react';
import { motion } from 'motion/react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-indigo-200 font-black uppercase tracking-widest text-[10px] mb-3 animate-pulse">
        <div className="w-3 h-3 bg-indigo-200 rounded-full" />
        Neural Processing...
      </div>
      
      <div className="space-y-3">
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-4 bg-slate-200 rounded-full w-3/4"
        />
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="h-4 bg-slate-200 rounded-full w-full"
        />
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="h-4 bg-slate-200 rounded-full w-5/6"
        />
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="h-4 bg-slate-200 rounded-full w-2/3"
        />
      </div>
    </div>
  );
};

export default SkeletonLoader;

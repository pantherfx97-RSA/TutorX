import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Check, 
  X, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Clock, 
  Infinity as InfinityIcon,
  Star,
  Trophy
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const features = [
    { title: 'Unlimited Neural Tokens', desc: 'No more daily limits on AI interactions.', icon: InfinityIcon },
    { title: 'Priority Neural Core', desc: 'Faster response times and advanced reasoning.', icon: Zap },
    { title: 'Math Guru OCR', desc: 'Unlimited image uploads for math solving.', icon: Brain },
    { title: 'Voice Lectures', desc: 'Unlock all premium neural voice personalities.', icon: Sparkles },
    { title: 'Offline Mastery', desc: 'Download lessons and quizzes for offline use.', icon: Clock },
    { title: 'Certificate of Mastery', desc: 'Official TutorX certificates for completed courses.', icon: Trophy },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
          >
            {/* Left Side - Visuals */}
            <div className="lg:w-1/2 bg-indigo-600 p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Star size={32} className="text-white" fill="currentColor" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    Unlock the Full Power of TutorX
                  </h2>
                  <p className="text-indigo-100 text-lg font-medium leading-relaxed">
                    Join 50,000+ students mastering their subjects with our premium neural engine.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-12">
                <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-widest">Secure Payment</div>
                    <div className="text-xs text-indigo-100 font-medium">30-Day Money Back Guarantee</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Plans & Features */}
            <div className="lg:w-1/2 p-12 md:p-16 space-y-12 overflow-y-auto max-h-[80vh] lg:max-h-none custom-scrollbar">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Premium Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {features.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                        <f.icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-white">{f.title}</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Plan</h3>
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                    <button className="relative w-full flex items-center justify-between p-6 bg-slate-950 border border-white/10 rounded-3xl hover:border-indigo-500/50 transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                          <Zap size={24} />
                        </div>
                        <div>
                          <div className="text-lg font-black tracking-tight">Monthly Pro</div>
                          <div className="text-xs text-slate-500 font-bold">Billed monthly. Cancel anytime.</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black tracking-tight">$9.99</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">/ Month</div>
                      </div>
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <button className="relative w-full flex items-center justify-between p-6 bg-slate-950 border-2 border-indigo-500 rounded-3xl text-left">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                          <Star size={24} fill="currentColor" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-black tracking-tight">Annual Mastery</div>
                            <span className="px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-black uppercase tracking-widest text-white">Save 40%</span>
                          </div>
                          <div className="text-xs text-slate-500 font-bold">Billed annually. Best value.</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black tracking-tight">$69.99</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">/ Year</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-50 transition-all shadow-2xl flex items-center justify-center gap-3">
                  Activate Premium Now
                </button>
                <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                  Secure Checkout • Neural Encryption Active
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;


import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import { YOCO_LINKS } from '../constants';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: (tier: SubscriptionTier) => void;
  targetTier: SubscriptionTier;
}

type BillingCycle = 'monthly' | 'yearly';

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade, targetTier }) => {
  const [hasSelected, setHasSelected] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const isPro = targetTier === SubscriptionTier.PRO;
  const tierName = isPro ? "PRO ACCESS" : "PREMIUM ACCESS";
  
  const price = {
    monthly: isPro ? "R199" : "R99",
    yearly: isPro ? "R1,990" : "R990"
  };

  const handlePlanSelection = (cycle: BillingCycle) => {
    const tierKey = isPro ? 'PRO' : 'PREMIUM';
    const cycleKey = cycle === 'monthly' ? 'MONTHLY' : 'YEARLY';
    const link = YOCO_LINKS[tierKey][cycleKey];
    window.open(link, '_blank');
    setHasSelected(true);
  };

  const confirmPayment = () => {
    setVerifying(true);
    setTimeout(() => { onUpgrade(targetTier); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
        
        <div className={`p-6 sm:p-10 text-white ${isPro ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] bg-white/20 px-2 py-0.5 rounded">Select Plan</span>
              <h2 className="text-2xl sm:text-4xl font-black">{tierName}</h2>
              <p className="text-indigo-100 text-[10px] sm:text-xs font-medium opacity-90">Maximize your learning potential today.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {!hasSelected ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => handlePlanSelection('monthly')} className="group p-5 sm:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950 transition-all text-left active:scale-[0.98]">
                  <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly</span>
                  <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">{price.monthly}<span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <div className="mt-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-center text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-colors">Select</div>
                </button>

                <button onClick={() => handlePlanSelection('yearly')} className="group p-5 sm:p-6 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-500 bg-white dark:bg-slate-900 transition-all text-left shadow-sm active:scale-[0.98] relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Save 20%</div>
                  <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest">Best Value</span>
                  <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">{price.yearly}<span className="text-xs font-normal text-slate-400">/yr</span></div>
                  <div className="mt-4 py-2 bg-indigo-600 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-700 shadow-lg">Select</div>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Premium Inclusions</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {["Timed Exams", "Deep-Dive Insights", "Priority AI Curation", "No-Limit Chatbot"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-bold">
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-10 space-y-6 animate-in slide-in-from-bottom-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full mx-auto flex items-center justify-center border-4 border-amber-100 dark:border-amber-800 animate-pulse-soft">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Secure Link Sent</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm mt-2 font-medium">Verify your project in the Yoco portal to continue.</p>
              </div>
              <button onClick={confirmPayment} disabled={verifying} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {verifying ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Already Paid? Verify Now"}
              </button>
              <button onClick={() => setHasSelected(false)} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Return to Selection</button>
            </div>
          )}
          
          <div className="mt-8 flex items-center justify-center gap-2 opacity-30 grayscale contrast-125">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Secured with Yoco</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

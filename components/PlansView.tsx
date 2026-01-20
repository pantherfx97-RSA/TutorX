
import React from 'react';
import { SubscriptionTier } from '../types';

interface PlansViewProps {
  currentTier: SubscriptionTier;
  onTriggerUpgrade: (tier: SubscriptionTier) => void;
}

const PlansView: React.FC<PlansViewProps> = ({ currentTier, onTriggerUpgrade }) => {
  const tiers = [
    {
      id: SubscriptionTier.FREE,
      name: "Free Access",
      label: "Standard Portal",
      price: "R0",
      description: "Foundational tools for students starting their AI learning journey.",
      features: [
        { text: "100 AI Questions per day", included: true },
        { text: "Standard AI Reasoning speed", included: true },
        { text: "Basic & Intermediate Subjects", included: true },
        { text: "Mobile PWA Installation", included: true },
        { text: "Document & Image Analysis", included: false },
        { text: "Unlimited Chat Sessions", included: false },
        { text: "Neural Voice Lectures", included: false },
        { text: "Advanced Academic Logic", included: false }
      ],
      buttonText: currentTier === SubscriptionTier.FREE ? "Current Plan" : "Downgrade",
      disabled: currentTier === SubscriptionTier.FREE
    },
    {
      id: SubscriptionTier.PREMIUM,
      name: "Elite Premium",
      label: "Advanced Clearance",
      price: "R99",
      description: "Powerful precision tools for high-performing students.",
      features: [
        { text: "Unlimited AI Questions", included: true },
        { text: "Priority Reasoning Speed", included: true },
        { text: "Document & Image Analysis", included: true },
        { text: "Full Masterclass Summary PDFS", included: true },
        { text: "Advanced Subject Support", included: true },
        { text: "Ad-free experience", included: true },
        { text: "Neural Voice Lectures", included: false },
        { text: "Pro Model Priority", included: false }
      ],
      buttonText: currentTier === SubscriptionTier.PREMIUM ? "Current Plan" : (currentTier === SubscriptionTier.PRO ? "Included" : "Go Elite"),
      disabled: currentTier === SubscriptionTier.PREMIUM || currentTier === SubscriptionTier.PRO,
      popular: true
    },
    {
      id: SubscriptionTier.PRO,
      name: "Neural Pro",
      label: "Total Mastery",
      price: "R199",
      description: "The ultimate engine for university-grade research and exams.",
      features: [
        { text: "Everything in Elite Premium", included: true },
        { text: "Unlimited Document Analysis", included: true },
        { text: "Neural Voice Lectures", included: true },
        { text: "Gemini 3 Pro reasoning core", included: true },
        { text: "Priority Support Access", included: true },
        { text: "Full Academic Archive", included: true },
        { text: "Early feature beta access", included: true },
        { text: "Multi-device synchronization", included: true }
      ],
      buttonText: currentTier === SubscriptionTier.PRO ? "Current Plan" : "Go Pro",
      disabled: currentTier === SubscriptionTier.PRO,
      dark: true
    }
  ];

  return (
    <div className="space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight">Access Tiers</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Select the clearance level that matches your academic goals. From foundational help to university-grade neural research.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 sm:px-0">
        {tiers.map((tier) => (
          <div 
            key={tier.id} 
            className={`relative flex flex-col p-8 rounded-[3rem] border-2 transition-all hover:scale-[1.02] ${
              tier.dark 
                ? 'bg-slate-900 border-indigo-500 text-white shadow-2xl shadow-indigo-500/20' 
                : tier.popular 
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
            }`}
          >
            {tier.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${tier.dark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'}`}>
                {tier.label}
              </span>
              <h3 className="text-2xl font-black mt-4">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">{tier.price}</span>
                <span className={`text-xs font-bold ${tier.dark ? 'text-slate-400' : 'text-slate-500'}`}>/month</span>
              </div>
              <p className={`mt-4 text-xs font-medium leading-relaxed ${tier.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                {tier.description}
              </p>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    feature.included 
                      ? (tier.dark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white') 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                  }`}>
                    {feature.included ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <span className={`text-[11px] font-bold ${
                    !feature.included ? 'text-slate-400 dark:text-slate-600 line-through decoration-slate-300 dark:decoration-slate-700' : (tier.dark ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300')
                  }`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => !tier.disabled && onTriggerUpgrade(tier.id)}
              disabled={tier.disabled}
              className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                tier.disabled 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                  : tier.dark
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/40'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl'
              }`}
            >
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 text-center space-y-4">
        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Secure South African Billing</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
          Payments are handled via secure Yoco encryption. Upgrade anytime. Your study history and neural archives are encrypted and private.
        </p>
      </div>
    </div>
  );
};

export default PlansView;

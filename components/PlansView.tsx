import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { PLANS } from '../constants';

const PlansView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">Choose Your Neural Tier</h1>
        <p className="text-slate-500 font-medium text-xl max-w-2xl mx-auto">
          Scale your learning engine with advanced AI capabilities and unlimited neural links.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 border-2 transition-all hover:shadow-2xl flex flex-col ${
              idx === 1 ? 'border-indigo-600 shadow-xl shadow-indigo-100 lg:scale-105 z-10' : 'border-slate-100 shadow-lg'
            }`}
          >
            {idx === 1 && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-slate-400 font-bold text-lg">/month</span>}
              </div>
            </div>

            <ul className="space-y-5 mb-10 flex-1">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-start gap-4 text-slate-600 font-medium">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${
              idx === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} />
            Enterprise Solutions
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-4">TutorX for Institutions</h2>
          <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed">
            Empower your entire school or organization with a custom-trained neural engine. 
            Integrate your own curriculum and track student progress in real-time.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button className="w-full md:w-auto px-10 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlansView;

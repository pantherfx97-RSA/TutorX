import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Scale, FileText, Shield, UserCheck, Zap, AlertTriangle, Ban } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <UserCheck size={24} className="text-indigo-400" />,
      content: "By accessing or using TutorX AI, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site."
    },
    {
      title: "2. Educational Use",
      icon: <AlertTriangle size={24} className="text-amber-400" />,
      content: "TutorX AI is designed for educational assistance and supplemental learning. While we strive for accuracy, the AI tutor may occasionally produce incorrect or biased information. Users should verify critical information independently."
    },
    {
      title: "3. User Responsibilities",
      icon: <Shield size={24} className="text-emerald-400" />,
      content: "Users must use the platform responsibly. You agree not to submit harmful, illegal, or offensive content. You must respect the service, its infrastructure, and other users within the community."
    },
    {
      title: "4. Account Responsibility",
      icon: <FileText size={24} className="text-blue-400" />,
      content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. TutorX AI cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation."
    },
    {
      title: "5. Service Availability",
      icon: <Zap size={24} className="text-purple-400" />,
      content: "TutorX AI is a dynamic platform. We reserve the right to change, improve, or discontinue features at any time without prior notice to ensure the best possible learning experience for our users."
    },
    {
      title: "6. Termination",
      icon: <Ban size={24} className="text-red-400" />,
      content: "TutorX AI reserves the right to suspend or terminate your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our business interests."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-indigo-500/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ArrowLeft size={20} />
            </div>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-indigo-500" />
            <span className="font-black tracking-tighter text-xl">Legal</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
            Terms of <span className="text-indigo-500">Service</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Last updated: March 16, 2026. Please read these terms carefully before using the TutorX Neural Engine.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12 group"
            >
              <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                {section.icon}
              </div>
              <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                {section.title}
              </h2>
              <p className="text-lg leading-relaxed text-slate-400 font-medium">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 pt-12 border-t border-slate-800 text-center"
        >
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">
            Questions about our terms?
          </p>
          <p className="text-slate-400 font-medium">
            Contact our legal team at <span className="text-indigo-400">legal@cipherx.inc</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, ChevronLeft, Mail, Globe } from 'lucide-react';

const PrivacyPolicyView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const sections = [
    {
      title: 'Data Collection',
      icon: Eye,
      content: 'We collect information you provide directly to us, such as when you create an account, use our AI tutoring services, or communicate with us. This includes your email, name, and the queries you send to our AI models.'
    },
    {
      title: 'How We Use Data',
      icon: Shield,
      content: 'Your data is used to provide, maintain, and improve our services, including personalizing your learning experience and developing new features. We do not sell your personal information to third parties.'
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: 'We implement industry-standard security measures to protect your data. This includes encryption of data in transit and at rest, and regular security audits of our systems.'
    },
    {
      title: 'Your Rights',
      icon: FileText,
      content: 'You have the right to access, correct, or delete your personal data. You can manage most of these settings directly within the app or by contacting our support team.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <header className="space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 font-medium text-lg">Last updated: March 17, 2024</p>
        </header>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4"
            >
              <div className="flex items-center gap-3 text-indigo-400">
                <section.icon size={20} />
                <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <footer className="pt-12 border-t border-white/5 text-center space-y-4">
          <p className="text-slate-500 text-sm font-medium">
            Have questions about our privacy practices?
          </p>
          <a 
            href="mailto:cipherxinc@gmail.com"
            className="inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            <Mail size={18} />
            cipherxinc@gmail.com
          </a>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;

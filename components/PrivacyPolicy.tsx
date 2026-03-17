import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: <Shield className="text-indigo-400" size={24} />,
      content: "TutorX AI respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI-powered learning application."
    },
    {
      id: "collection",
      title: "2. Information Collected",
      icon: <Eye className="text-indigo-400" size={24} />,
      content: "We collect several types of information to provide and improve our services:",
      list: [
        "Account Information: Your name and email address provided during registration or social login.",
        "Learning Progress: Data related to your lesson completion, quiz results, and mastery levels.",
        "Usage Data: Interaction logs and query history used to optimize AI responses and personalize your experience."
      ]
    },
    {
      id: "usage",
      title: "3. How Data Is Used",
      icon: <Database className="text-indigo-400" size={24} />,
      content: "Your data is processed for the following purposes:",
      list: [
        "Personalizing lessons and learning pathways to match your skill level.",
        "Tracking and visualizing your learning progress over time.",
        "Improving the AI tutor's accuracy and helpfulness through aggregated usage analysis."
      ]
    },
    {
      id: "security",
      title: "4. Data Security",
      icon: <Lock className="text-indigo-400" size={24} />,
      content: "TutorX AI employs industry-standard security measures. We use secure authentication protocols and encrypted storage provided by Firebase (a Google Cloud service) to ensure your information remains protected against unauthorized access."
    },
    {
      id: "third-party",
      title: "5. Third-Party Services",
      icon: <Globe className="text-indigo-400" size={24} />,
      content: "We utilize trusted third-party services to provide core functionality:",
      list: [
        "Google Authentication: For secure account access and identity verification.",
        "AI APIs (e.g., Google Gemini): Limited data (such as your learning queries) may be processed to generate educational content."
      ]
    },
    {
      id: "rights",
      title: "6. User Rights",
      icon: <UserCheck className="text-indigo-400" size={24} />,
      content: "You maintain full control over your data. You have the right to access your information or request the permanent deletion of your account and all associated learning data at any time through your profile settings or by contacting our support team."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">X</span>
            </div>
            <span className="font-black tracking-tighter text-xl">TutorX AI</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6">
            Privacy <span className="text-indigo-500">Policy</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
            Last updated: March 16, 2026. Your privacy is our priority. Learn how we protect your neural learning data.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                    {section.title}
                  </h2>
                  <p className="text-slate-400 font-medium leading-relaxed mb-4">
                    {section.content}
                  </p>
                  {section.list && (
                    <ul className="space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300 font-medium">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-slate-800 text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            &copy; 2026 TutorX AI • Developed by CipherX Inc
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

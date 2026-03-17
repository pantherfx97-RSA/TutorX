import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  Search, 
  ChevronRight, 
  MessageSquare, 
  Mail, 
  Phone, 
  Book, 
  Zap, 
  Shield, 
  User, 
  Settings,
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SupportViewProps {
  onBack: () => void;
  userEmail?: string;
  userName?: string;
}

const SupportView: React.FC<SupportViewProps> = ({ onBack, userEmail, userName }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      icon: Zap,
      questions: [
        { q: 'How do I start a masterclass?', a: 'Navigate to the Masterclasses tab, select a topic, and click "Start Learning".' },
        { q: 'Can I use TutorX offline?', a: 'Yes! Your chat history and saved answers are available offline automatically.' },
      ]
    },
    {
      category: 'Neural Engine',
      icon: Sparkles,
      questions: [
        { q: 'What are Learning Modes?', a: 'Learning Modes adjust the AI’s tone and complexity. For example, ELI10 simplifies concepts for beginners.' },
        { q: 'How accurate is the Math Guru?', a: 'Our Neural Solver uses advanced OCR and mathematical reasoning to provide step-by-step verified solutions.' },
      ]
    },
    {
      category: 'Account & Privacy',
      icon: Shield,
      questions: [
        { q: 'Is my data secure?', a: 'We use industry-standard encryption and never share your personal learning data with third parties.' },
        { q: 'How do I upgrade to Premium?', a: 'Click the "Upgrade" button in your profile or sidebar to unlock unlimited neural tokens.' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-xs font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
            <HelpCircle size={14} />
            Help Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">How can we help you?</h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-2 flex items-center">
              <div className="pl-6 text-slate-500">
                <Search size={24} />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, guides, or help..."
                className="flex-1 bg-transparent py-5 px-6 outline-none font-bold text-lg placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'User Guides', desc: 'Step-by-step tutorials', icon: Book, color: 'text-indigo-400' },
            { title: 'Community', desc: 'Join the discussion', icon: User, color: 'text-emerald-400' },
            { title: 'API Status', desc: 'Check system health', icon: Zap, color: 'text-amber-400' },
          ].map((link) => (
            <button key={link.title} className="p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] hover:bg-slate-900 transition-all text-left space-y-4 group">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform`}>
                <link.icon size={24} />
              </div>
              <div>
                <h3 className="font-black tracking-tight">{link.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{link.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="space-y-12">
          <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {faqs.map((cat) => (
              <div key={cat.category} className="space-y-8">
                <div className="flex items-center gap-3 text-indigo-400">
                  <cat.icon size={20} />
                  <h3 className="text-lg font-black uppercase tracking-widest">{cat.category}</h3>
                </div>
                <div className="space-y-6">
                  {cat.questions.map((item, idx) => (
                    <div key={idx} className="space-y-2 group cursor-pointer">
                      <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        {item.q}
                        <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 space-y-6 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight">Still need help?</h2>
            <p className="text-indigo-100 text-lg font-medium max-w-md leading-relaxed">
              Our support team is available 24/7 to assist you with any questions or technical issues.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2">
                <MessageSquare size={16} />
                Live Chat
              </button>
              <button className="px-8 py-4 bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-800 transition-all flex items-center gap-2">
                <Mail size={16} />
                Email Us
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center">
              <Headphones size={80} className="text-white opacity-50" />
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-16 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Privacy Policy</button>
            <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Terms of Service</button>
            <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Security</button>
          </div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            TutorX AI • Neural Support Core v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

const Headphones: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

export default SupportView;

import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageSquare, Globe, ChevronLeft, Send, Github, Twitter, Linkedin } from 'lucide-react';

const ContactView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <header className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Mail size={32} className="text-indigo-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Get in Touch</h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Have a question, feedback, or just want to say hi? Our team is here to help you succeed.
              </p>
            </header>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl">
                <div className="p-3 bg-indigo-600/20 rounded-xl text-indigo-400">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Us</p>
                  <a href="mailto:cipherxinc@gmail.com" className="text-lg font-bold text-white hover:text-indigo-400 transition-colors">
                    cipherxinc@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl">
                <div className="p-3 bg-emerald-600/20 rounded-xl text-emerald-400">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Support</p>
                  <p className="text-lg font-bold text-white">Available 24/7</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <button key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
            <h2 className="text-2xl font-black tracking-tight">Send a Message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500/50 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500/50 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Message</label>
                <textarea 
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 outline-none focus:border-indigo-500/50 transition-all font-bold resize-none"
                />
              </div>
              <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3">
                <Send size={18} />
                Transmit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;

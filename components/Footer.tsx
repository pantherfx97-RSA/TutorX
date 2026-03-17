import React from 'react';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';

interface FooterProps {
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
  onContactClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({
  onPrivacyClick,
  onTermsClick,
  onContactClick
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 px-6 mt-auto border-t border-white/5 bg-slate-950/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* App Identity & Tagline */}
        <div className="space-y-2">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-400 font-display font-black text-sm tracking-widest uppercase"
          >
            TutorX AI © {currentYear}
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-sm font-medium tracking-tight"
          >
            Empowering students through intelligent learning.
          </motion.p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {[
            { label: 'Privacy Policy', onClick: onPrivacyClick },
            { label: 'Terms & Conditions', onClick: onTermsClick },
            { label: 'Contact', onClick: onContactClick }
          ].map((link, index) => (
            <motion.button
              key={link.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={link.onClick}
              className="text-slate-500 hover:text-indigo-400 text-sm font-bold transition-all relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500/50 transition-all group-hover:w-full" />
            </motion.button>
          ))}
        </nav>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center space-y-3"
        >
          <a 
            href="mailto:cipherxinc@gmail.com"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all group active:scale-95"
          >
            <Mail size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Support: cipherxinc@gmail.com</span>
          </a>
        </motion.div>

        {/* Company Branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
            Powered by CipherX Inc.
          </p>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;

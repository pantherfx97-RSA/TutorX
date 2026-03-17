import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Zap, 
  Trash2, 
  LogOut, 
  ChevronRight,
  Moon,
  MessageSquare,
  Info,
  ExternalLink,
  Mail,
  Lock,
  Sparkles,
  Check
} from 'lucide-react';

interface SettingsItem {
  id: string;
  label: string;
  icon: any;
  type: 'toggle' | 'action' | 'link' | 'switch';
  value?: any;
  options?: string[];
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SettingsView: React.FC = () => {
  const [responseStyle, setResponseStyle] = useState<'Concise' | 'Detailed'>('Detailed');
  const [notifications, setNotifications] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [aiModel, setAiModel] = useState('Neural Core v3.1');

  const settingsSections: SettingsSection[] = [
    {
      title: 'AI Preferences',
      items: [
        { 
          id: 'model',
          label: 'AI Model', 
          icon: Sparkles, 
          value: aiModel,
          type: 'toggle',
          options: ['Neural Core v3.1', 'Flash v2.0']
        },
        { 
          id: 'style',
          label: 'Response Style', 
          icon: MessageSquare, 
          value: responseStyle,
          type: 'toggle',
          options: ['Concise', 'Detailed']
        },
        { 
          id: 'history',
          label: 'Clear Chat History', 
          icon: Trash2, 
          type: 'action',
          danger: true
        }
      ]
    },
    {
      title: 'Account & Security',
      items: [
        { id: 'profile', label: 'Edit Profile', icon: User, type: 'link' },
        { id: 'notifications', label: 'Push Notifications', icon: Bell, type: 'switch', value: notifications },
        { id: 'privacy', label: 'Privacy Settings', icon: Lock, type: 'link' }
      ]
    },
    {
      title: 'Support & Legal',
      items: [
        { id: 'help', label: 'Help Center', icon: Info, type: 'link' },
        { id: 'contact', label: 'Contact Support', icon: Mail, type: 'link' },
        { id: 'terms', label: 'Terms of Service', icon: Shield, type: 'link' }
      ]
    }
  ];

  const handleClearHistory = () => {
    setIsClearing(true);
    setTimeout(() => setIsClearing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 lg:p-20">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Settings size={24} className="animate-spin-slow" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.4em]">System Configuration</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight font-display">Settings</h1>
          <p className="text-slate-500 font-medium text-xl max-w-2xl">
            Fine-tune your neural learning engine for peak performance and personalized synthesis.
          </p>
        </header>

        {/* Premium Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={180} />
          </div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
                <Sparkles size={16} />
                Neural Capacity Status
              </div>
              <h2 className="text-4xl font-black text-white font-display">TutorX Evolved</h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md">
                You are currently operating at maximum capacity with unlimited neural synthesis and priority access.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-slate-950 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/10">
              Manage Subscription
            </button>
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-12">
          {settingsSections.map((section, sIdx) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-6">
                {section.title}
              </h3>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {section.items.map((item, idx) => (
                  <div 
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 hover:bg-white/[0.02] transition-all group ${
                      idx !== section.items.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl transition-all ${
                        item.danger 
                          ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20' 
                          : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'
                      }`}>
                        <item.icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-lg font-black ${item.danger ? 'text-red-500' : 'text-white'}`}>
                          {item.label}
                        </span>
                        <p className="text-sm text-slate-500 font-medium">
                          {item.id === 'style' && 'Choose how the AI communicates with you.'}
                          {item.id === 'model' && 'Select the underlying neural architecture.'}
                          {item.id === 'history' && 'Permanently erase all previous interactions.'}
                          {item.id === 'profile' && 'Update your personal neural identity.'}
                          {item.id === 'notifications' && 'Configure real-time neural alerts.'}
                          {item.id === 'privacy' && 'Manage your data encryption and visibility.'}
                          {item.id === 'help' && 'Access the knowledge base and tutorials.'}
                          {item.id === 'contact' && 'Direct link to our support engineers.'}
                          {item.id === 'terms' && 'Review the neural usage agreement.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {item.type === 'toggle' && (
                        <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-white/5">
                          {item.options?.map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                if (item.id === 'style') setResponseStyle(opt as any);
                                if (item.id === 'model') setAiModel(opt);
                              }}
                              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                (item.id === 'style' ? responseStyle === opt : aiModel === opt)
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {item.type === 'switch' && (
                        <button 
                          onClick={() => setNotifications(!notifications)}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                            notifications ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-800'
                          }`}
                        >
                          <motion.div 
                            animate={{ x: notifications ? 32 : 4 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      )}

                      {item.type === 'action' && (
                        <button 
                          onClick={item.id === 'history' ? handleClearHistory : undefined}
                          className={`text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-xl transition-all border ${
                            item.danger 
                              ? 'text-red-500 border-red-500/20 hover:bg-red-500/10' 
                              : 'text-indigo-400 border-indigo-400/20 hover:bg-indigo-400/10'
                          }`}
                        >
                          {isClearing ? 'Purging...' : 'Execute'}
                        </button>
                      )}

                      {item.type === 'link' && (
                        <div className="p-3 bg-white/5 rounded-xl text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="pt-12 border-t border-white/5">
          <button className="group flex items-center justify-between w-full p-8 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-[2.5rem] transition-all">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl">
                <LogOut size={24} />
              </div>
              <div className="text-left">
                <p className="text-lg font-black text-red-500">Terminate Session</p>
                <p className="text-sm text-red-500/60 font-medium">Sign out of all devices and clear local cache.</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Footer Info */}
        <footer className="text-center space-y-4 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Core v3.1.4 Online</span>
          </div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
            © 2024 CipherX Inc. Neural Learning Division
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsView;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  CreditCard, 
  LogOut, 
  Shield, 
  Bell,
  Mail,
  Camera,
  HelpCircle,
  Scale,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { firebaseService } from '../services/firebaseService';

interface ProfileProps {
  profile: UserProfile;
  onPrivacyClick: () => void;
  onSupportClick: () => void;
  onTermsClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  onPrivacyClick, 
  onSupportClick, 
  onTermsClick,
  onAboutClick,
  onContactClick
}) => {
  const [activeTab, setActiveTab] = useState('General');
  const [density, setDensity] = useState(2);
  const [theme, setTheme] = useState(() => localStorage.getItem('tutorx-theme') || 'Dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false
  });
  const [twoFactor, setTwoFactor] = useState(false);

  const updateDensity = (val: number) => {
    setDensity(val);
    const root = document.documentElement;
    const densityMap: { [key: number]: string } = {
      1: '1.25rem',
      2: '1rem',
      3: '0.75rem'
    };
    root.style.setProperty('--neural-density', densityMap[val]);
  };

  useEffect(() => {
    const applyTheme = (t: string) => {
      const root = document.documentElement;
      if (t === 'Light') {
        root.classList.add('light');
      } else if (t === 'Dark') {
        root.classList.remove('light');
      } else if (t === 'Auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.remove('light');
        } else {
          root.classList.add('light');
        }
      }
      localStorage.setItem('tutorx-theme', t);
    };

    applyTheme(theme);

    // Listen for system theme changes if set to Auto
    if (theme === 'Auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('Auto');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const tabs = ['General', 'Security', 'Billing', 'Notifications', 'Display'];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-10">
      <h1 className="text-5xl font-black tracking-tight text-white mb-12 font-display">Account Settings</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all relative overflow-hidden group ${
                  activeTab === tab 
                    ? 'text-white' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="relative z-10">
                  {tab === 'General' && <User size={22} />}
                  {tab === 'Security' && <Shield size={22} />}
                  {tab === 'Billing' && <CreditCard size={22} />}
                  {tab === 'Notifications' && <Bell size={22} />}
                  {tab === 'Display' && <Settings size={22} />}
                </span>
                <span className="truncate relative z-10 text-lg">{tab}</span>
                {activeTab === tab && (
                  <motion.div 
                    layoutId="profile-tab-active"
                    className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/5 mt-8 space-y-3">
            <button 
              onClick={onAboutClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <Zap size={22} />
              <span className="text-lg">About TutorX</span>
            </button>
            <button 
              onClick={onContactClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <Mail size={22} />
              <span className="text-lg">Contact Us</span>
            </button>
            <button 
              onClick={onPrivacyClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <Shield size={22} />
              <span className="text-lg">Privacy Policy</span>
            </button>
            <button 
              onClick={onSupportClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <HelpCircle size={22} />
              <span className="text-lg">Contact Support</span>
            </button>
            <button 
              onClick={onTermsClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <Scale size={22} />
              <span className="text-lg">Terms of Service</span>
            </button>
            <button 
              onClick={() => firebaseService.logout()}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut size={22} />
              <span className="text-lg">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900/50 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 backdrop-blur-xl min-w-0">
          {activeTab === 'General' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center text-5xl font-black border-4 border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10">{profile.fullName.charAt(0)}</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-slate-800 shadow-2xl border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <Camera size={22} />
                  </button>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-black text-white font-display mb-2">{profile.fullName}</h3>
                  <p className="text-slate-500 font-medium text-lg mb-4">{profile.email}</p>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                    {profile.tier} Member
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total XP</p>
                  <p className="text-4xl font-black text-white">{profile.xp || 0}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Neural Link Strength</p>
                  <p className="text-4xl font-black text-white">{profile.learningProgress}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={profile.fullName}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl outline-none transition-all font-medium text-white text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue={profile.email}
                    disabled
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none font-medium text-white text-lg opacity-40 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Role</label>
                  <select
                    defaultValue={profile.role}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl outline-none transition-all font-bold text-white text-lg appearance-none"
                  >
                    <option className="bg-slate-900">Student</option>
                    <option className="bg-slate-900">Tutor</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Learning Goal</label>
                  <select
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl outline-none transition-all font-bold text-white text-lg appearance-none"
                  >
                    <option className="bg-slate-900">Academic Excellence</option>
                    <option className="bg-slate-900">Professional Growth</option>
                    <option className="bg-slate-900">Personal Interest</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 border-t border-white/5 flex justify-end">
                <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tight font-display">Security Protocol</h3>
                <p className="text-slate-500 font-medium text-lg">Manage your neural access credentials and security layers.</p>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-xl font-black text-white mb-1">Two-Factor Authentication</p>
                      <p className="text-slate-500 font-medium">Add an extra layer of security to your neural link.</p>
                    </div>
                    <button 
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`w-16 h-9 rounded-full relative transition-all duration-300 ${twoFactor ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: twoFactor ? 28 : 4 }}
                        className="absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-xl font-black text-white mb-6">Update Access Key</h4>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl outline-none transition-all font-medium text-white text-lg"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl outline-none transition-all font-medium text-white text-lg"
                    />
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/5">
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <h4 className="text-xl font-black text-white mb-6">Active Neural Sessions</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                          <Settings size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white">Chrome on macOS</p>
                          <p className="text-xs text-slate-500">Current Session • London, UK</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tight font-display">Neural Alerts</h3>
                <p className="text-slate-500 font-medium text-lg">Configure how you receive updates and progress reports.</p>
              </div>

              <div className="space-y-6">
                {[
                  { id: 'email', title: 'Email Notifications', desc: 'Receive masterclass updates and neural insights via email.' },
                  { id: 'push', title: 'Push Notifications', desc: 'Get real-time alerts for quiz results and streak milestones.' },
                  { id: 'weekly', title: 'Weekly Progress Reports', desc: 'A detailed analysis of your cognitive growth delivered every Monday.' }
                ].map((item) => (
                  <div key={item.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="max-w-md">
                      <p className="text-xl font-black text-white mb-1">{item.title}</p>
                      <p className="text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                      className={`w-16 h-9 rounded-full relative transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-white/10'}`}
                    >
                      <motion.div 
                        animate={{ x: notifications[item.id as keyof typeof notifications] ? 28 : 4 }}
                        className="absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="space-y-12">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden border border-white/5">
                <div className="relative z-10">
                  <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-xs mb-3">Current Plan</p>
                  <h3 className="text-4xl font-black mb-6 font-display">TutorX {profile.tier}</h3>
                  <p className="text-slate-400 font-medium text-lg mb-8">Your next billing date is April 12, 2026.</p>
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-100 transition-all shadow-xl active:scale-95">
                    Upgrade Plan
                  </button>
                </div>
                <CreditCard className="absolute -right-12 -bottom-12 w-64 h-64 text-white opacity-5" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-white mb-6 font-display">Payment Methods</h4>
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs border border-white/5">VISA</div>
                    <div>
                      <p className="font-black text-white text-lg tracking-wider">•••• •••• •••• 4242</p>
                      <p className="text-sm text-slate-500 font-bold">Expires 12/28</p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-indigo-400 font-black uppercase tracking-[0.2em] text-xs transition-colors">Edit</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Display' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tight font-display">Display Settings</h3>
                <p className="text-slate-500 font-medium text-lg">Optimize the neural interface for your visual comfort.</p>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-xl font-black text-white mb-1">Interface Theme</p>
                      <p className="text-slate-500 font-medium">Choose between light, dark, or system neural sync.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['Light', 'Dark', 'Auto'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 transition-all ${
                          theme === t 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-xl font-black text-white mb-1">Neural Resolution</p>
                      <p className="text-slate-500 font-medium">Adjust the information density of the interface.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      value={density}
                      onChange={(e) => updateDensity(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      <span>Standard</span>
                      <span>High Density</span>
                      <span>Ultra</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-white mb-1">Auto-Adjust Resolution</p>
                      <p className="text-slate-500 font-medium">Automatically optimize display based on device capabilities.</p>
                    </div>
                    <div className="w-16 h-9 bg-indigo-600 rounded-full relative cursor-pointer shadow-xl shadow-indigo-600/20">
                      <div className="absolute right-1.5 top-1.5 w-6 h-6 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'General' && activeTab !== 'Billing' && activeTab !== 'Display' && activeTab !== 'Security' && activeTab !== 'Notifications' && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 mb-8 border border-white/5">
                <Settings size={48} className="animate-spin-slow" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3 font-display">{activeTab} Settings</h3>
              <p className="text-slate-500 font-medium text-lg max-w-md">This section is currently being optimized for your neural engine. Check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

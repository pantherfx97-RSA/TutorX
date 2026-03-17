import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Mail, ArrowRight, Chrome, Lock, User as UserIcon } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Student' | 'Tutor'>('Student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await firebaseService.loginWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await firebaseService.loginUser(email, password);
      } else {
        await firebaseService.registerUser(email, password, fullName, role);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-8 shadow-2xl shadow-indigo-500/20"
          >
            <Brain size={40} />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 font-display">
            {isLogin ? 'Welcome Back' : 'Join TutorX'}
          </h1>
          <p className="text-slate-400 font-medium text-lg">
            {isLogin ? 'Initialize your neural connection.' : 'Start your cognitive evolution today.'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-6 px-8 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl disabled:opacity-50 group relative overflow-hidden"
          >
            <Chrome size={20} className="text-indigo-600" />
            <span className="relative z-10">Continue with Google</span>
            <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all relative z-10" />
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full flex items-center justify-center gap-4 py-6 px-8 bg-slate-900/50 backdrop-blur-xl text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all group"
            >
              <Mail size={20} className="text-slate-400" />
              Continue with Email
              <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 mt-8 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      <div className="relative group">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl outline-none transition-all text-white font-medium placeholder:text-slate-600"
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setRole('Student')}
                          className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${role === 'Student' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950/50 text-slate-500 border-white/5 hover:border-white/10'}`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('Tutor')}
                          className={`py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${role === 'Tutor' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950/50 text-slate-500 border-white/5 hover:border-white/10'}`}
                        >
                          Tutor
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl outline-none transition-all text-white font-medium placeholder:text-slate-600"
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-white/5 focus:border-indigo-500/50 rounded-2xl outline-none transition-all text-white font-medium placeholder:text-slate-600"
                    placeholder="Password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] hover:text-white transition-colors"
                >
                  Go Back
                </button>
              </form>
            </motion.div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 font-bold hover:text-white transition-colors group"
          >
            {isLogin ? "New to TutorX? " : "Already have an account? "}
            <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">{isLogin ? "Create an account" : "Sign In"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

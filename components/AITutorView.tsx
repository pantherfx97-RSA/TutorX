import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Trash2,
  Mic,
  Camera,
  BookOpen,
  Volume2,
  VolumeX,
  Loader2,
  Copy,
  Share2,
  Bookmark,
  ChevronLeft,
  WifiOff,
  GraduationCap,
  Atom,
  Languages,
  Lightbulb,
  Check,
  MoreVertical,
  RefreshCcw,
  Plus,
  Zap,
  Download,
  MessageSquare,
  Settings,
  User,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';

interface AITutorViewProps {
  initialTopic?: string | null;
  onClearTopic?: () => void;
  onBack?: () => void;
}

type Subject = 'Math' | 'Science' | 'English' | 'General Help';
type Difficulty = 'Simple' | 'Intermediate' | 'Advanced';
type LearningMode = 'Standard' | 'ELI10' | 'Exam Mode' | 'University Mode' | 'Slow Learner Mode' | 'Quick Revision Mode';
type VoicePersonality = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

const AITutorView: React.FC<AITutorViewProps> = ({ initialTopic, onClearTopic, onBack }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; id: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAutoReadEnabled, setIsAutoReadEnabled] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('General Help');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [learningMode, setLearningMode] = useState<LearningMode>('Standard');
  const [voicePersonality, setVoicePersonality] = useState<VoicePersonality>('Zephyr');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll, loading]);

  useEffect(() => {
    if (initialTopic) {
      handleSend(initialTopic);
      onClearTopic?.();
    }
  }, [initialTopic]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading || isOffline) return;

    const messageId = Date.now().toString();
    const userMsg = { role: 'user' as const, text: textToSend, id: messageId };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: 'model', text: '', id: modelMsgId }]);

    try {
      let fullText = '';
      await geminiService.chatWithTutorStream(
        messages, 
        textToSend, 
        (chunk) => {
          fullText += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'model') {
              lastMsg.text += chunk;
            }
            return newMessages;
          });
        },
        selectedSubject,
        difficulty,
        learningMode
      );

      if (isAutoReadEnabled && fullText) {
        handleSpeak(fullText, messages.length + 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Neural link interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TutorX AI Explanation',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(text, 'share');
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (speakingIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSpeakingIndex(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setSpeakingIndex(index);
      const cleanText = text.replace(/[#*`_~]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const base64Audio = await geminiService.generateSpeech(cleanText, voicePersonality);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeakingIndex(null);
          audioRef.current = null;
        };
        audio.play().catch(e => {
          console.error("Playback failed:", e);
          setSpeakingIndex(null);
        });
      }
    } catch (err) {
      setSpeakingIndex(null);
    }
  };

  const subjects = [
    { id: 'General Help', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'Math', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'Science', icon: Atom, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'English', icon: Languages, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ] as const;

  const learningModes = [
    { id: 'Standard', icon: Brain, desc: 'Balanced educational approach' },
    { id: 'ELI10', icon: Zap, desc: 'Explain Like I’m 10' },
    { id: 'Exam Mode', icon: ShieldCheck, desc: 'Direct & exam-focused' },
    { id: 'University Mode', icon: BookOpen, desc: 'Advanced academic depth' },
    { id: 'Slow Learner Mode', icon: RefreshCcw, desc: 'Tiny, simplified steps' },
    { id: 'Quick Revision Mode', icon: Lightbulb, desc: 'Concise summaries' },
  ] as const;

  const personalities = [
    { id: 'Zephyr', icon: Headphones, desc: 'Professional & Clear' },
    { id: 'Puck', icon: Sparkles, desc: 'Energetic & Fun' },
    { id: 'Charon', icon: Brain, desc: 'Deep & Philosophical' },
    { id: 'Kore', icon: User, desc: 'Warm & Encouraging' },
    { id: 'Fenrir', icon: Zap, desc: 'Bold & Direct' },
  ] as const;

  const suggestions = [
    { label: "Explain simpler", prompt: "Can you explain that in simpler terms?" },
    { label: "Give examples", prompt: "Can you give me some real-world examples?" },
    { label: "Test me", prompt: "Can you give me a quick quiz on this?" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Premium Header */}
      <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">TutorX AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Core v3.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-red-400"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 flex items-center justify-center gap-2 text-amber-500 text-xs font-bold"
          >
            <WifiOff size={14} />
            Offline Mode: Viewing saved answers only
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col p-6 gap-8 bg-slate-950/30 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Subject Focus</h3>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id as Subject)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${
                    selectedSubject === sub.id 
                      ? `${sub.bg} border-${sub.color.split('-')[1]}-500/30 ${sub.color}` 
                      : 'border-transparent bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <sub.icon size={18} />
                  <span className="text-[10px] font-bold">{sub.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Learning Mode</h3>
            <div className="space-y-2">
              {learningModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLearningMode(mode.id as LearningMode)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                    learningMode === mode.id 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                      : 'border-transparent bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <mode.icon size={16} />
                  <div>
                    <div className="text-xs font-bold">{mode.id}</div>
                    <div className="text-[9px] opacity-60">{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Neural Voice</h3>
            <div className="grid grid-cols-1 gap-2">
              {personalities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setVoicePersonality(p.id as VoicePersonality)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                    voicePersonality === p.id 
                      ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' 
                      : 'border-transparent bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <p.icon size={16} />
                  <div>
                    <div className="text-xs font-bold">{p.id}</div>
                    <div className="text-[9px] opacity-60">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-indigo-400">Premium Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                You have unlimited neural tokens and priority access.
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Main Area */}
        <main className="flex-1 flex flex-col relative bg-slate-950">
          {/* Mobile Subject Selector */}
          <div className="lg:hidden flex items-center gap-2 p-4 overflow-x-auto no-scrollbar border-b border-white/5">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id as Subject)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border ${
                  selectedSubject === sub.id 
                    ? `${sub.bg} border-${sub.color.split('-')[1]}-500/30 ${sub.color}` 
                    : 'bg-white/5 border-transparent text-slate-400'
                }`}
              >
                <sub.icon size={14} />
                {sub.id}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-8"
                >
                  <Sparkles size={40} className="text-indigo-400" />
                </motion.div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">Ready to Learn?</h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                  I am your Neural Tutor. Select a subject and ask me anything. I'll adapt to your learning style.
                </p>
                
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {["How does gravity work?", "Explain the Pythagorean theorem", "What is a metaphor?", "How do plants breathe?"].map((q) => (
                    <button 
                      key={q}
                      onClick={() => handleSend(q)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold text-slate-300 transition-all text-left flex items-center gap-3"
                    >
                      <MessageSquare size={16} className="text-indigo-400" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full space-y-10">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`group relative max-w-[90%] md:max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-lg shadow-indigo-500/10' 
                        : 'w-full'
                    }`}>
                      {msg.role === 'model' && (
                        <div className="flex gap-4">
                          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-900 border border-white/10 items-center justify-center shrink-0">
                            <Brain size={20} className="text-indigo-400" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 text-slate-200 leading-relaxed shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600/50" />
                              <div className="prose prose-invert max-w-none 
                                prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed
                                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                                prose-strong:text-white prose-strong:font-bold
                                prose-code:text-indigo-400 prose-code:bg-indigo-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5
                              ">
                                <Markdown>{msg.text}</Markdown>
                              </div>
                            </div>
                            
                            {/* Response Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleSpeak(msg.text, idx)}
                                className={`p-2 rounded-lg border transition-all ${
                                  speakingIndex === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                }`}
                                title="Read Aloud"
                              >
                                {speakingIndex === idx ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                              </button>
                              <button 
                                onClick={() => handleCopy(msg.text, msg.id)}
                                className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                                title="Copy"
                              >
                                {copiedId === msg.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                              </button>
                              <button 
                                onClick={() => handleSave(msg.id)}
                                className={`p-2 border rounded-lg transition-all ${
                                  savedIds.has(msg.id) ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                }`}
                                title="Save to Vault"
                              >
                                <Bookmark size={16} fill={savedIds.has(msg.id) ? "currentColor" : "none"} />
                              </button>
                              <button 
                                onClick={() => handleShare(msg.text)}
                                className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                                title="Share"
                              >
                                <Share2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <span className="text-sm font-bold">{msg.text}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <div className="flex gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-900 border border-white/10 items-center justify-center shrink-0">
                      <Brain size={20} className="text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center gap-4">
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neural Processing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          <div className="p-4 md:p-8 shrink-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Quick Suggestions */}
              {messages.length > 0 && !loading && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.prompt)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-bold text-slate-400 hover:text-white transition-all whitespace-nowrap flex items-center gap-2"
                    >
                      <Plus size={14} />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Bar */}
              <div className="relative group">
                <div className={`relative flex items-center bg-slate-900/80 backdrop-blur-2xl border border-white/10 focus-within:border-indigo-500/50 rounded-2xl md:rounded-3xl transition-all shadow-2xl ${isOffline ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="hidden sm:flex pl-6 text-slate-500">
                    <Sparkles size={20} />
                  </div>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isOffline ? "Offline..." : "Ask your tutor anything..."}
                    className="flex-1 bg-transparent py-4 md:py-6 px-4 md:px-6 outline-none font-bold text-sm md:text-base resize-none min-h-[56px] max-h-48 text-white placeholder:text-slate-600"
                    rows={1}
                  />
                  <div className="pr-2 md:pr-4 flex items-center gap-1 md:gap-2">
                    <button
                      className="p-2 md:p-3 text-slate-500 hover:text-indigo-400 transition-all rounded-xl hover:bg-white/5"
                      title="Voice Input"
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      className="p-2 md:p-3 text-slate-500 hover:text-indigo-400 transition-all rounded-xl hover:bg-white/5"
                      title="Upload Document"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                TutorX AI Neural Engine v3.1 • Premium Access
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AITutorView;

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Send, 
  Sparkles, 
  Brain, 
  History, 
  Trash2,
  Maximize2,
  Minimize2,
  Camera,
  ChevronLeft,
  Lightbulb,
  Zap,
  Check,
  Copy,
  Share2,
  Bookmark,
  Loader2,
  Plus,
  MessageSquare,
  Atom
} from 'lucide-react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';

interface MathGuruViewProps {
  initialTopic?: string | null;
  onClearTopic?: () => void;
  onBack?: () => void;
}

const MathGuruView: React.FC<MathGuruViewProps> = ({ initialTopic, onClearTopic, onBack }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; id: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll, loading]);

  useEffect(() => {
    if (initialTopic) {
      if (initialTopic === "Analyze my homework image") {
        handleFileUpload();
      } else {
        handleSend(initialTopic);
      }
      onClearTopic?.();
    }
  }, [initialTopic]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    const messageId = Date.now().toString();
    const userMsg = { role: 'user' as const, text: textToSend, id: messageId };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { role: 'model', text: '', id: modelMsgId }]);

    try {
      await geminiService.solveMathProblemStream(textToSend, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'model') {
            lastMsg.text += chunk;
          }
          return newMessages;
        });
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Neural link interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const messageId = Date.now().toString();
        const userMsg = { role: 'user' as const, text: `[Uploaded Image: ${file.name}] Please solve this math problem step-by-step.`, id: messageId };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        setError(null);

        const modelMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { role: 'model', text: '', id: modelMsgId }]);

        try {
          await geminiService.analyzeImageStream(
            base64String, 
            file.type, 
            "You are the TutorX Math Guru. Analyze this image of a math problem and solve it step-by-step with clear explanations.",
            (chunk) => {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg && lastMsg.role === 'model') {
                  lastMsg.text += chunk;
                }
                return newMessages;
              });
            }
          );
        } catch (err: any) {
          console.error(err);
          setError(err.message || "Neural link interrupted during image analysis.");
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
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

  const suggestions = [
    { label: "Explain deeper", prompt: "Can you explain the underlying concept in more detail?" },
    { label: "Try similar problem", prompt: "Can you give me a similar problem to practice?" },
    { label: "Check my work", prompt: "I solved it differently. Can I show you my steps?" },
  ];

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans transition-all duration-500 ${isFullscreen ? 'p-0' : ''}`}>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Math Guru</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Solver v2.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-red-400"
            title="Clear Session"
          >
            <Trash2 size={20} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col p-6 gap-8 bg-slate-950/30 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Math Capabilities</h3>
            <div className="space-y-2">
              {[
                { label: 'Algebra', icon: Brain },
                { label: 'Calculus', icon: Zap },
                { label: 'Geometry', icon: Atom },
                { label: 'Statistics', icon: Sparkles },
              ].map((cap) => (
                <div key={cap.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400">
                  <cap.icon size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Lightbulb size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Neural Insight</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                I don't just solve; I explain the "why" behind every step.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col relative bg-slate-950">
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
                  className="w-20 h-20 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mb-8"
                >
                  <Calculator size={40} className="text-emerald-400" />
                </motion.div>
                <h2 className="text-3xl font-black mb-4 tracking-tight">What shall we solve?</h2>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                  Enter any mathematical expression or word problem. I'll provide a structured neural breakdown.
                </p>
                
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {[
                    'Solve 3x^2 - 5x + 2 = 0', 
                    'Integral of sin(x)cos(x)', 
                    'Find the limit of (sin x)/x as x -> 0', 
                    'Area of a circle with radius 5'
                  ].map((q) => (
                    <button 
                      key={q}
                      onClick={() => handleSend(q)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold text-slate-300 transition-all text-left flex items-center gap-3"
                    >
                      <MessageSquare size={16} className="text-emerald-400" />
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
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-lg shadow-emerald-500/10' 
                        : 'w-full'
                    }`}>
                      {msg.role === 'model' && (
                        <div className="flex gap-4">
                          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-900 border border-white/10 items-center justify-center shrink-0">
                            <Brain size={20} className="text-emerald-400" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 text-slate-200 leading-relaxed shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600/50" />
                              <div className="prose prose-invert max-w-none 
                                prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed
                                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight
                                prose-strong:text-white prose-strong:font-bold
                                prose-code:text-emerald-400 prose-code:bg-emerald-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5
                              ">
                                <Markdown>{msg.text}</Markdown>
                              </div>
                            </div>
                            
                            {/* Response Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <Brain size={20} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center gap-4">
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-emerald-500" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-emerald-500" />
                          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neural Solving...</span>
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
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-2xl border border-white/10 focus-within:border-emerald-500/50 rounded-2xl md:rounded-3xl transition-all shadow-2xl">
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
                    placeholder="Enter math problem or upload image..."
                    className="flex-1 bg-transparent py-4 md:py-6 px-4 md:px-6 outline-none font-bold text-sm md:text-base resize-none min-h-[56px] max-h-48 text-white placeholder:text-slate-600"
                    rows={1}
                  />
                  <div className="pr-2 md:pr-4 flex items-center gap-1 md:gap-2">
                    <button
                      onClick={handleFileUpload}
                      className="p-2 md:p-3 text-slate-500 hover:text-emerald-400 transition-all rounded-xl hover:bg-white/5"
                      title="Upload Image"
                    >
                      <Camera size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] text-center text-slate-600 font-bold uppercase tracking-widest">
                TutorX Math Guru v2.0 • Neural Solver Active
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MathGuruView;


import React, { useState, useEffect, useRef } from 'react';
import { LessonContent, AppScreen, SubscriptionTier } from '../types';
import QuizView from './QuizView';
import { askTutor } from '../services/geminiService';

interface LessonViewProps {
  content: LessonContent;
  onComplete: (score: number) => void;
  onNavigate: (topic: string) => void;
  onTriggerUpgrade: (tier: SubscriptionTier) => void;
  onBack: () => void;
  tier: SubscriptionTier;
}

type Tab = 'learn' | 'review' | 'ask' | 'exam' | 'voice' | 'next';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const StarConfetti = () => {
  const [stars, setStars] = useState<any[]>([]);
  useEffect(() => {
    const colors = ['#f59e0b', '#fbbf24', '#4f46e5', '#818cf8'];
    const newStars = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1}s`,
      duration: `${3 + Math.random() * 2}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: `${Math.random() * 12 + 8}px`,
    }));
    setStars(newStars);
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
      {stars.map((s) => (
        <div key={s.id} className="absolute pointer-events-none" style={{ left: s.left, top: '-20px', animation: `confetti-fall ${s.duration} linear ${s.delay} forwards`, color: s.color }}>
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
        </div>
      ))}
    </div>
  );
};

const LessonView: React.FC<LessonViewProps> = ({ content, onComplete, onNavigate, onTriggerUpgrade, onBack, tier }) => {
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [quizFinished, setQuizFinished] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Chat States
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  useEffect(() => {
    if (activeTab !== 'voice') window.speechSynthesis.cancel();
    if (activeTab === 'ask') scrollToBottom();
  }, [activeTab, chatHistory, isTyping]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const toggleSpeech = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(content.lesson.replace(/[#*]/g, ''));
      utterance.rate = speechRate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const response = await askTutor(userMsg, content, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'model', text: "Connectivity lost. Retrying brain link..." }]);
    } finally { setIsTyping(false); }
  };

  const isTabLocked = (tab: Tab) => {
    if (tab === 'exam' && tier === SubscriptionTier.FREE) return true;
    if (tab === 'voice' && tier !== SubscriptionTier.PRO) return true;
    return false;
  };

  const handleTabClick = (id: Tab) => {
    if (id === 'exam' && tier === SubscriptionTier.FREE) return onTriggerUpgrade(SubscriptionTier.PREMIUM);
    if (id === 'voice' && tier !== SubscriptionTier.PRO) return onTriggerUpgrade(SubscriptionTier.PRO);
    setActiveTab(id);
  };

  const TabButton = ({ id, label, icon }: { id: Tab; label: string; icon: React.ReactNode }) => {
    const locked = isTabLocked(id);
    const active = activeTab === id;
    return (
      <button
        onClick={() => handleTabClick(id)}
        className={`flex flex-col items-center justify-center min-w-[70px] xs:min-w-[80px] h-16 sm:h-20 rounded-2xl transition-all relative shrink-0 active:scale-90 ${
          active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {icon}
        <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">{label}</span>
        {locked && <div className="absolute top-1 right-1"><svg className="h-3 w-3 text-slate-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>}
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto w-full">
      {lessonCompleted && activeTab === 'learn' && <StarConfetti />}
      
      <div className="flex items-center">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 dark:text-slate-600 hover:text-indigo-600 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          <span>Exit</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[70dvh] transition-colors overflow-hidden">
        <div className="mb-6 px-2">
           <span className="text-[9px] sm:text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Masterclass</span>
           <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-50 leading-tight">{content.topic}</h2>
        </div>

        {/* Swipeable Responsive Tab Bar */}
        <div className="relative group mb-6">
           <div className="flex space-x-1 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
            <TabButton id="learn" label="Lesson" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>} />
            <TabButton id="ask" label="Tutor Chat" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} />
            <TabButton id="review" label="Summary" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293" /></svg>} />
            <TabButton id="exam" label="Exam" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <TabButton id="voice" label="Listen" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4" /></svg>} />
            <TabButton id="next" label="Forward" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>} />
           </div>
           {/* Visual cues for mobile scroll */}
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none rounded-r-3xl sm:hidden"></div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'learn' && (
            <div className="prose prose-slate dark:prose-invert max-w-none animate-in fade-in slide-in-from-left-2 duration-300 overflow-y-auto pr-2">
              <div className="whitespace-pre-wrap leading-relaxed text-base sm:text-lg text-slate-700 dark:text-slate-300 px-1 pb-10 font-medium">
                {content.lesson}
              </div>
              <div className="flex justify-center pb-8 sticky bottom-0 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent pt-10">
                {!lessonCompleted ? (
                  <button onClick={() => { setLessonCompleted(true); setTimeout(() => setActiveTab('review'), 2500); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]">Complete Class</button>
                ) : <div className="text-emerald-500 font-black text-sm uppercase tracking-widest flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Mastered</div>}
              </div>
            </div>
          )}

          {activeTab === 'ask' && (
            <div className="flex flex-col flex-1 h-full min-h-[450px] animate-in fade-in duration-300">
              <div className="flex-1 overflow-y-auto space-y-4 p-2 no-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="text-center py-12 opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest leading-loose px-10">AI Brain Sync Complete. Ask any follow-up question about this lesson.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none animate-pulse-soft flex gap-1"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s]"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div></div>}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="mt-auto pt-4 flex gap-2 border-t border-slate-100 dark:border-slate-800">
                <input type="text" placeholder="Explain X in simple terms..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <button type="submit" disabled={!chatInput.trim() || isTyping} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:opacity-40 transition-all"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
              </form>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300 p-2 overflow-y-auto">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Core Axioms</h3>
              <ul className="space-y-3">
                {content.summary.map((point, i) => (
                  <li key={i} className="flex items-start bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="bg-indigo-600 text-white rounded-lg w-5 h-5 flex items-center justify-center text-[10px] font-black mr-3 mt-0.5 shrink-0">{i + 1}</span>
                    <span className="text-slate-700 dark:text-slate-300 leading-snug text-sm font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'exam' && <div className="animate-in fade-in duration-300 p-2 h-full"><QuizView questions={content.quiz} onComplete={(score) => { setQuizScore(score); setQuizFinished(true); onComplete(score); }} /></div>}

          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
              <div className="relative w-40 h-40">
                 <div className={`absolute inset-0 bg-indigo-500/20 rounded-full animate-ping ${isSpeaking && !isPaused ? 'opacity-30' : 'opacity-0'}`}></div>
                 <div className="relative w-full h-full bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-700 shadow-xl">
                    {isSpeaking && !isPaused ? (
                      <div className="flex gap-1 items-end h-10">
                        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="w-1 bg-indigo-500 rounded-full animate-bounce" style={{ height: `${40 + Math.random() * 60}%`, animationDuration: `${0.4 + i * 0.1}s` }}></div>)}
                      </div>
                    ) : <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4" /></svg>}
                 </div>
              </div>
              <div className="text-center space-y-4 px-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Audio Synthesis</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium max-w-xs mx-auto">Listen to the full lesson curated by TutorX AI. Perfect for learning on the go.</p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setSpeechRate(prev => prev === 1.5 ? 1 : prev + 0.25)} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black">{speechRate}x</button>
                  <button onClick={toggleSpeech} className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-2xl flex items-center justify-center active:scale-90 transition-all">{isSpeaking && !isPaused ? <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg> : <svg className="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}</button>
                  <button onClick={() => window.speechSynthesis.cancel()} className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'next' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300 p-2 overflow-y-auto">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Path Progression</h3>
              <div className="grid grid-cols-1 gap-3">
                {content.next_topics.map((t, i) => (
                  <button key={i} onClick={() => onNavigate(t.topic)} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl text-left transition-all active:scale-[0.98] flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{t.difficulty}</p>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{t.topic}</p>
                    </div>
                    <svg className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;

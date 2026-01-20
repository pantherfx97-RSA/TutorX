import React, { useState, useEffect, useRef } from 'react';
import { LessonContent, AppScreen, SubscriptionTier } from '../types';
import QuizView from './QuizView';
import { askTutor, generateGeminiSpeech } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { FREE_DAILY_QUESTION_LIMIT } from '../constants';

interface LessonViewProps {
  content: LessonContent;
  onComplete: (score: number) => void;
  onMarkMastery: (topic: string) => void;
  onNavigate: (topic: string) => void;
  onTriggerUpgrade: (tier: SubscriptionTier) => void;
  onBack: () => void;
  tier: SubscriptionTier;
  questionsAskedToday: number;
  onQuestionAsked: () => void;
}

type Tab = 'learn' | 'review' | 'ask' | 'exam' | 'voice' | 'next';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AVAILABLE_VOICES = [
  { id: 'Kore', label: 'Energetic', icon: '⚡' },
  { id: 'Puck', label: 'Friendly', icon: '🤝' },
  { id: 'Zephyr', label: 'Professional', icon: '👔' },
  { id: 'Fenrir', label: 'Warm', icon: '🔥' },
  { id: 'Charon', label: 'Serious', icon: '⚖️' },
];

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
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

const LessonView: React.FC<LessonViewProps> = ({ 
  content, onComplete, onMarkMastery, onNavigate, onTriggerUpgrade, onBack, tier,
  questionsAskedToday, onQuestionAsked
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const limitReached = tier === SubscriptionTier.FREE && questionsAskedToday >= FREE_DAILY_QUESTION_LIMIT;

  // Added handleVoiceChange to fix reference error and handle voice switching
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    stopAudio();
  };

  useEffect(() => {
    if (activeTab !== 'voice') stopAudio();
    if (activeTab === 'ask') scrollToBottom();
  }, [activeTab]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const stopAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current.clear();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    window.speechSynthesis.cancel();
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const exportSummaryPDF = () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(10);
      doc.text("TutorX Masterclass Archive", 20, 20);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(content.topic, 20, 35);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const summaryText = content.summary.map((p, i) => `${i+1}. ${p}`).join('\n\n');
      const splitText = doc.splitTextToSize(summaryText, 170);
      doc.text(splitText, 20, 50);
      doc.save(`TutorX_Summary_${content.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      alert("Archive generation failed.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleSpeech = async () => {
    if (isSpeaking && !isPaused) {
      if (audioContextRef.current) audioContextRef.current.suspend();
      else window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      if (audioContextRef.current) audioContextRef.current.resume();
      else window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      setIsSynthesizing(true);
      
      // Speed Optimization: Split text into small initial chunk for instant response
      const paragraphs = content.lesson.split('\n\n').filter(p => p.trim());
      const firstParagraph = paragraphs[0];
      const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim().length > 5);
      const immediateChunk = sentences.slice(0, 1).join('. ') + '.';
      const restOfFirstParagraph = sentences.slice(1).join('. ') + '.';
      
      const chunks = [immediateChunk, restOfFirstParagraph, ...paragraphs.slice(1)];

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;
        nextStartTimeRef.current = ctx.currentTime;
        setIsSpeaking(true);

        // Fetch and play first chunk immediately
        await streamChunk(chunks[0], ctx);
        setIsSynthesizing(false); // UI feels "finished" loading immediately after speech starts

        // Queue subsequent chunks
        for (let i = 1; i < chunks.length; i++) {
          if (!audioContextRef.current) break;
          if (chunks[i].trim().length > 0) {
            await streamChunk(chunks[i], ctx);
          }
        }
      } catch (e) {
        startBrowserSpeech();
      } finally {
        setIsSynthesizing(false);
      }
    }
  };

  const streamChunk = async (text: string, ctx: AudioContext) => {
    try {
      const base64 = await generateGeminiSpeech(text, selectedVoice);
      const bytes = decodeBase64(base64);
      const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
      if (!audioContextRef.current) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      activeSourcesRef.current.add(source);
      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };
    } catch (e) {
      console.error("Chunk synthesis error:", e);
    }
  };

  const startBrowserSpeech = () => {
    const utterance = new SpeechSynthesisUtterance(content.lesson.replace(/[#*]/g, ''));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping || streamingMessage || limitReached) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    scrollToBottom();
    try {
      const response = await askTutor(userMsg, content, chatHistory, tier);
      onQuestionAsked();
      setIsTyping(false); 
      let currentText = "";
      for (let i = 0; i < response.length; i++) {
        currentText += response[i];
        setStreamingMessage(currentText);
        if (i % 12 === 0) scrollToBottom();
        await new Promise(r => setTimeout(r, 10));
      }
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      setStreamingMessage('');
      scrollToBottom();
    } catch (error) {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { role: 'model', text: "Neural link error." }]);
    }
  };

  const TabButton = ({ id, label, icon }: { id: Tab; label: string; icon: React.ReactNode }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex flex-col items-center justify-center min-w-[70px] xs:min-w-[80px] h-16 sm:h-20 rounded-2xl transition-all relative shrink-0 active:scale-90 ${
          active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
        }`}
      >
        {icon}
        <span className="text-[9px] font-black uppercase mt-1.5 tracking-tighter">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto w-full">
      {lessonCompleted && activeTab === 'learn' && <StarConfetti />}
      <div className="flex items-center">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 dark:text-slate-600 hover:text-indigo-600 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors active:scale-95">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          <span>Exit Portal</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[70dvh] transition-colors overflow-hidden">
        <div className="mb-6 px-2 flex justify-between items-start">
           <div>
              <span className="text-[9px] sm:text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Active Curation</span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-50 leading-tight tracking-tight">{content.topic}</h2>
           </div>
           {activeTab === 'learn' && (
             <button 
                onClick={toggleSpeech}
                disabled={isSynthesizing}
                className={`p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 ${isSpeaking && !isPaused ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}
             >
                {isSynthesizing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
                <span className="hidden sm:inline font-black text-[10px] uppercase tracking-widest">{isSpeaking ? 'Narrating...' : 'Listen to Lesson'}</span>
             </button>
           )}
        </div>
        <div className="relative group mb-6">
           <div className="flex space-x-1 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-x-auto no-scrollbar scroll-smooth">
            <TabButton id="learn" label="Lesson" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>} />
            <TabButton id="ask" label="AI Tutor" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} />
            <TabButton id="review" label="Summary" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
            <TabButton id="exam" label="Quiz" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <TabButton id="voice" label="Voices" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>} />
            <TabButton id="next" label="Next" icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>} />
           </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
          {activeTab === 'learn' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{content.lesson}</p>
              </div>
              {!lessonCompleted && (
                <button
                  onClick={async () => {
                    setIsRecording(true);
                    await onMarkMastery(content.topic);
                    setLessonCompleted(true);
                    setIsRecording(false);
                  }}
                  disabled={isRecording}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isRecording ? "Updating Neural Matrix..." : "Acknowledge Mastery"}
                </button>
              )}
            </div>
          )}
          {activeTab === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
              <div className="flex justify-between items-center px-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Actionable Takeaways</p>
                <button onClick={exportSummaryPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                  {isGeneratingPDF ? "Archiving..." : "Export PDF"}
                </button>
              </div>
              <div className="space-y-4">
                {content.summary.map((point, idx) => (
                  <div key={idx} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-all">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20">{idx + 1}</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'ask' && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex justify-between items-center px-2 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TutorX Reasoning Matrix</p>
                {tier === SubscriptionTier.FREE && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${limitReached ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-500/10 text-indigo-600'}`}>
                    {questionsAskedToday} / {FREE_DAILY_QUESTION_LIMIT} Questions Used
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2 no-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'}`}>{msg.text}</div>
                  </div>
                ))}
                {streamingMessage && <div className="flex justify-start"><div className="max-w-[85%] p-4 rounded-3xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm font-bold">{streamingMessage}</div></div>}
                <div ref={chatEndRef} />
              </div>
              {limitReached ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/20 rounded-3xl text-center space-y-3">
                   <p className="text-sm font-black text-slate-800 dark:text-white">Daily Neural Limit Reached</p>
                   <p className="text-xs text-slate-500 font-medium">Free users are capped at 100 questions per day.</p>
                   <button onClick={() => onTriggerUpgrade(SubscriptionTier.PREMIUM)} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Upgrade for Unlimited Access</button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="relative">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask TutorX anything..." className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold outline-none" />
                  <button type="submit" disabled={!chatInput.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl active:scale-95 disabled:opacity-50"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
                </form>
              )}
            </div>
          )}
          {activeTab === 'exam' && <QuizView questions={content.quiz} onComplete={onComplete} />}
          {activeTab === 'voice' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all ${isSpeaking && !isPaused ? 'scale-110 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : ''}`}>
                {isSynthesizing ? <svg className="animate-spin h-12 w-12 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className={`h-16 w-16 ${isSpeaking ? 'text-indigo-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>}
              </div>
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {AVAILABLE_VOICES.map((v) => (
                    <button key={v.id} onClick={() => handleVoiceChange(v.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 ${selectedVoice === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>{v.icon}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button onClick={toggleSpeech} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 flex items-center gap-3 active:scale-95 transition-all">
                  {isSpeaking && !isPaused ? "Pause Stream" : isPaused ? "Resume Audio" : "Play Lecture"}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'next' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.next_topics.map((t, idx) => (
                  <button key={idx} onClick={() => onNavigate(t.topic)} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-left hover:border-indigo-500 shadow-sm transition-all active:scale-95 group">
                    <span className="text-[10px] font-black text-indigo-500 uppercase">{t.difficulty}</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-2">{t.topic}</p>
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
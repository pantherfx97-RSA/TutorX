
import React, { useState, useEffect, useRef } from 'react';
import { LessonContent, AppScreen, SubscriptionTier, TutorMode } from '../types';
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

// Improved FormattedText component for superior readability
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Handle Headings (### **Text**)
        if (trimmed.startsWith('###')) {
          const content = trimmed.replace(/###/g, '').trim();
          return (
            <h3 key={i} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tighter flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full hidden sm:block"></span>
              {parseBold(content)}
            </h3>
          );
        }

        // Handle Bullet Points
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.substring(1).trim();
          return (
            <div key={i} className="flex gap-3 ml-3 group">
              <span className="text-indigo-600 dark:text-indigo-400 font-black mt-1.5 text-xs">◆</span>
              <span className="flex-1 text-slate-700 dark:text-slate-200 text-sm sm:text-base">{parseBold(content)}</span>
            </div>
          );
        }

        // Default line
        return (
          <p key={i} className="leading-relaxed text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to parse **bold** text manually
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10 px-1 rounded shadow-sm border border-indigo-100/50 dark:border-indigo-900/30">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const AVAILABLE_VOICES = [
  { id: 'Kore', label: 'Energetic', icon: '⚡', desc: 'High-energy & motivating' },
  { id: 'Puck', label: 'Friendly', icon: '🤝', desc: 'Approachable & casual' },
  { id: 'Zephyr', label: 'Professional', icon: '👔', desc: 'Clear & academic' },
  { id: 'Fenrir', label: 'Warm', icon: '🔥', desc: 'Calm & reassuring' },
  { id: 'Charon', label: 'Serious', icon: '⚖️', desc: 'Direct & authoritative' },
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
  const [tutorMode, setTutorMode] = useState<TutorMode>('auto');
  const [voiceSync, setVoiceSync] = useState(false);

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

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    stopAudio();
  };

  useEffect(() => {
    if (activeTab === 'ask') scrollToBottom();
  }, [activeTab]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
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

  const exportChatPDF = () => {
    if (chatHistory.length === 0) {
      alert("No conversation history to export.");
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const addBranding = () => {
        // Watermark
        doc.setTextColor(235, 235, 245);
        doc.setFontSize(60);
        doc.setFont("helvetica", "bold");
        doc.text("CONFIDENTIAL", pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 45,
        });

        // Header
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("TutorX", 20, 20);
        
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("NEURAL LEARNING ENGINE | SESSION ARCHIVE", 20, 28);

        // Date
        doc.setFontSize(10);
        doc.text(`DATE: ${new Date().toLocaleString()}`, pageWidth - 20, 20, { align: "right" });
      };

      addBranding();

      // Topic
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOPIC: ${content.topic}`, 20, 45);

      // Chat Content
      doc.setFontSize(11);
      let y = 55;
      
      chatHistory.forEach((msg) => {
        const role = msg.role === 'user' ? 'STUDENT' : 'TUTORX';
        const roleColor = msg.role === 'user' ? [79, 70, 229] : [30, 41, 59];
        
        doc.setFont("helvetica", "bold");
        // @ts-ignore
        doc.setTextColor(...roleColor);
        doc.text(`${role}:`, 20, y);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85); // Slate-700
        const lines = doc.splitTextToSize(msg.text.replace(/[*#]/g, ''), 170);
        
        lines.forEach((line: string) => {
          if (y > pageHeight - 30) {
            doc.addPage();
            addBranding();
            y = 40;
          }
          doc.text(line, 20, y);
          y += 6;
        });
        y += 8;
      });

      doc.save(`TutorX_Session_${content.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Neural session archival failed.");
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
      await startNarration(content.lesson);
    }
  };

  const startNarration = async (text: string) => {
    setIsSynthesizing(true);
    const chunks = text.split('\n\n').filter(p => p.trim());
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }
      setIsSpeaking(true);
      for (const chunk of chunks) {
        if (!audioContextRef.current) break;
        await streamChunk(chunk, audioContextRef.current);
      }
    } catch (e) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ''));
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const streamChunk = async (text: string, ctx: AudioContext) => {
    try {
      const cleanedText = text.replace(/[*#]/g, '');
      const base64 = await generateGeminiSpeech(cleanedText, selectedVoice);
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
        if (activeSourcesRef.current.size === 0) { setIsSpeaking(false); setIsPaused(false); }
      };
    } catch (e) { console.error("Synthesis error:", e); }
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
      const response = await askTutor(userMsg, content, chatHistory, tier, tutorMode);
      onQuestionAsked();
      setIsTyping(false); 
      
      // Typewriter Effect
      let currentText = "";
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setStreamingMessage(currentText);
        if (i % 8 === 0) scrollToBottom();
        await new Promise(r => setTimeout(r, Math.random() * 25 + 15));
      }
      
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      setStreamingMessage('');
      scrollToBottom();

      if (voiceSync) { await startNarration(response); }
    } catch (error) {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ Neural link interrupted. Please try again." }]);
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
      <div className="flex items-center justify-between">
        <button 
          onClick={() => { stopAudio(); onBack(); }} 
          className="flex items-center space-x-2 text-slate-400 dark:text-slate-600 hover:text-indigo-600 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          <span>Exit Portal</span>
        </button>
        {isSpeaking && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 rounded-full animate-pulse-soft">
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Link</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce"></div>
              <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col min-h-[70dvh] transition-colors overflow-hidden">
        <div className="mb-6 px-2 flex justify-between items-start">
           <div>
              <span className="text-[9px] sm:text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Active Curation</span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-50 leading-tight tracking-tight">{content.topic}</h2>
           </div>
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
              <div className="flex justify-end">
                <button onClick={toggleSpeech} disabled={isSynthesizing} className={`p-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 ${isSpeaking && !isPaused ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'}`}>
                   {isSynthesizing ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                   <span className="text-[10px] font-black uppercase tracking-widest">{isSpeaking ? 'Narrating...' : 'Start Lecture'}</span>
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none"><FormattedText text={content.lesson} /></div>
              {!lessonCompleted && (
                <button onClick={async () => { setIsRecording(true); await onMarkMastery(content.topic); setLessonCompleted(true); setIsRecording(false); }} disabled={isRecording} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                  {isRecording ? "Updating Neural Matrix..." : "Acknowledge Mastery"}
                </button>
              )}
            </div>
          )}
          {activeTab === 'ask' && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col gap-4 px-2 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setVoiceSync(!voiceSync)} className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${voiceSync ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Voice Sync {voiceSync ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <button 
                    onClick={exportChatPDF} 
                    disabled={isGeneratingPDF || chatHistory.length === 0} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {isGeneratingPDF ? 'Archiving...' : 'Export Session'}
                  </button>
                </div>
                <div className="flex p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                  {['auto', 'university', 'eli10', 'exam', 'slow', 'quick'].map(m => (
                    <button key={m} onClick={() => setTutorMode(m as TutorMode)} className={`flex-1 min-w-[80px] py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${tutorMode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                      {m === 'auto' ? '🤖 Smart' : m === 'university' ? 'Uni' : m === 'eli10' ? 'ELI10' : m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto mb-4 pr-2 no-scrollbar scroll-smooth">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                      {msg.role === 'user' ? msg.text : <FormattedText text={msg.text} />}
                    </div>
                  </div>
                ))}
                
                {streamingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] p-5 rounded-3xl rounded-tl-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 text-sm font-bold animate-in fade-in duration-300">
                      <FormattedText text={streamingMessage} />
                      <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>
                    </div>
                  </div>
                )}

                {isTyping && !streamingMessage && (
                  <div className="flex justify-start items-center gap-3 animate-in fade-in slide-in-from-left-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none flex gap-1.5 shadow-sm border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 animate-pulse"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-150"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce delay-300"></div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Neural Linking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {limitReached ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/20 rounded-3xl text-center space-y-3">
                   <p className="text-sm font-black text-slate-800 dark:text-white">Daily Neural Limit Reached</p>
                   <p className="text-xs text-slate-500 font-medium">Upgrade for unlimited neural questions.</p>
                   <button onClick={() => onTriggerUpgrade(SubscriptionTier.PREMIUM)} className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Upgrade Now</button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder="Ask TutorX for clarification..." 
                    className="relative w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-bold outline-none focus:border-indigo-500 transition-all" 
                  />
                  <button type="submit" disabled={!chatInput.trim() || isTyping || !!streamingMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl active:scale-95 disabled:opacity-50 transition-all shadow-lg z-10">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  </button>
                </form>
              )}
            </div>
          )}
          {activeTab === 'exam' && <QuizView questions={content.quiz} onComplete={onComplete} />}
          {activeTab === 'voice' && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Neural Personalities</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Select your learning conduit</p>
              </div>
              <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all ${isSpeaking && !isPaused ? 'scale-110 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : ''}`}>
                {isSynthesizing ? <svg className="animate-spin h-12 w-12 text-indigo-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className={`h-16 w-16 ${isSpeaking ? 'text-indigo-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>}
              </div>
              <div className="w-full max-w-sm space-y-6">
                <div className="grid grid-cols-5 gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                  {AVAILABLE_VOICES.map((v) => (
                    <button key={v.id} onClick={() => handleVoiceChange(v.id)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${selectedVoice === v.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter">{v.id}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                   <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-1">{AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.label}</p>
                   <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed">{AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.desc}</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center pt-2">
                <button onClick={toggleSpeech} className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:bg-indigo-700 flex items-center gap-3 active:scale-95 transition-all">
                  {isSpeaking && !isPaused ? "Pause Conduit" : isPaused ? "Resume Audio" : "Play Lecture"}
                </button>
                {isSpeaking && <button onClick={stopAudio} className="px-6 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Stop</button>}
              </div>
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
              <div className="space-y-4">{content.summary.map((point, idx) => (<div key={idx} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-all"><div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">{idx + 1}</div><div className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed"><FormattedText text={point} /></div></div>))}</div>
            </div>
          )}
          {activeTab === 'next' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{content.next_topics.map((t, idx) => (<button key={idx} onClick={() => { stopAudio(); onNavigate(t.topic); }} className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-left hover:border-indigo-500 shadow-sm transition-all active:scale-95 group"><span className="text-[10px] font-black text-indigo-500 uppercase">{t.difficulty}</span><p className="font-bold text-slate-800 dark:text-slate-100 mt-2">{t.topic}</p></button>))}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;

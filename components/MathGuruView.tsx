
import React, { useState, useRef, useEffect } from 'react';
import { askMathGuru } from '../services/geminiService';
import { SubscriptionTier } from '../types';

interface MathGuruViewProps {
  onBack: () => void;
  tier: SubscriptionTier;
  onQuestionAsked: () => void;
}

interface MathMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const FormattedMathText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-4 font-sans">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        
        if (trimmed.startsWith('###')) {
          const content = trimmed.replace(/###/g, '').trim();
          return (
            <h3 key={i} className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-8 mb-4 tracking-tighter flex items-center gap-3 border-b-2 border-indigo-100 dark:border-indigo-900/30 pb-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full hidden sm:block"></span>
              {parseMathSpans(content)}
            </h3>
          );
        }

        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.substring(1).trim();
          return (
            <div key={i} className="flex gap-4 ml-2 group py-1">
              <span className="text-indigo-600 dark:text-indigo-400 font-black mt-1.5 text-xs">◆</span>
              <span className="flex-1 text-slate-800 dark:text-slate-100 text-sm sm:text-base font-bold leading-relaxed">
                {parseMathSpans(content)}
              </span>
            </div>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-slate-900 dark:text-slate-50 font-bold text-sm sm:text-base">
            {parseMathSpans(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const parseMathSpans = (text: string) => {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-black text-indigo-700 dark:text-indigo-300">
          {processExponents(part.slice(2, -2))}
        </strong>
      );
    }
    return <React.Fragment key={i}>{processExponents(part)}</React.Fragment>;
  });
};

const processExponents = (text: string) => {
  const parts = text.split(/(\^[a-zA-Z0-9]+)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('^')) {
      return <sup key={i} className="text-xs ml-0.5 text-indigo-600 dark:text-indigo-400 font-black">{part.slice(1)}</sup>;
    }
    const withBetterOps = part.replace(/[×÷±≠≈√]/g, (match) => ` ${match} `);
    return withBetterOps;
  });
};

const MathGuruView: React.FC<MathGuruViewProps> = ({ onBack, tier, onQuestionAsked }) => {
  const [messages, setMessages] = useState<MathMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamingText, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setImageMime(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading || !!streamingText) return;

    const userMsg: MathMessage = { role: 'user', text: input, image: selectedImage || undefined };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    const imageData = selectedImage ? selectedImage.split(',')[1] : undefined;
    const currentMime = imageMime;
    
    setSelectedImage(null);
    setImageMime(null);

    try {
      const response = await askMathGuru(
        userMsg.text,
        imageData ? { data: imageData, mimeType: currentMime! } : undefined,
        tier
      );
      
      onQuestionAsked();
      setIsLoading(false);
      setIsTyping(true);

      let currentText = "";
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setStreamingText(currentText);
        await new Promise(r => setTimeout(r, 25 + Math.random() * 20));
      }

      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setStreamingText('');
      setIsTyping(false);
      
    } catch (error) {
      setIsLoading(false);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'model', text: "❌ Neural link interrupted. Could not process math logic." }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-2xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
          <span>Exit Guru Mode</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full shadow-lg">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Math Guru Protocol</span>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-2">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-8">
              <div className="text-6xl mb-4 animate-float">📐</div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Math Mastery Initialization</h3>
              <p className="text-xs font-bold text-slate-500 max-w-xs leading-relaxed uppercase tracking-tight">
                Upload a photo of your homework or type a problem. TutorX will provide step-by-step logic.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-6 rounded-3xl text-sm font-bold shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="mb-4 rounded-xl border-4 border-white/10 max-w-full h-auto shadow-lg" />
                )}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.role === 'user' ? msg.text : <FormattedMathText text={msg.text} />}
                </div>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex flex-col items-start gap-2">
              <div className="max-w-[90%] p-6 rounded-3xl rounded-tl-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 text-sm font-bold shadow-sm animate-in fade-in duration-300">
                <div className="whitespace-pre-wrap leading-relaxed">
                  <FormattedMathText text={streamingText} />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="flex gap-1">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TutorX is typing...</span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="relative w-5 h-5">
                   <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                   <div className="relative flex gap-1 items-center justify-center h-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
                   </div>
                </div>
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">Calculating Steps...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="mt-6 space-y-4">
          {selectedImage && (
            <div className="relative inline-block group">
              <img src={selectedImage} alt="Selected" className="h-24 w-24 object-cover rounded-xl border-2 border-indigo-500 shadow-xl" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform border-2 border-white dark:border-slate-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="mb-1 p-4 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm flex items-center justify-center shrink-0 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            
            <div className="flex-1 relative">
              <textarea 
                ref={textareaRef}
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder="Type complex problem here..." 
                rows={1}
                className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 text-sm font-bold outline-none focus:border-indigo-500 transition-all resize-none min-h-[56px] overflow-y-auto no-scrollbar shadow-inner" 
              />
              <button 
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedImage) || isLoading || !!streamingText} 
                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl active:scale-95 disabled:opacity-50 transition-all shadow-lg hover:bg-indigo-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGuruView;

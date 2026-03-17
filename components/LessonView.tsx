import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Share2, 
  Bookmark,
  Sparkles,
  PlayCircle,
  XCircle,
  RefreshCcw,
  ArrowRight,
  Brain,
  MessageSquare,
  Send,
  Lightbulb,
  Target,
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { firebaseService } from '../services/firebaseService';
import { UserProfile } from '../types';

interface LessonViewProps {
  topic: string;
  userId: string;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
  onComplete: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ topic, userId, profile, onUpdateProfile, onBack, onComplete }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const isBookmarked = profile.bookmarkedLessons?.some(b => b.topic === topic) || false;

  const handleToggleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      const newBookmarks = await firebaseService.toggleBookmark(userId, topic, difficulty);
      if (newBookmarks) {
        onUpdateProfile({ ...profile, bookmarkedLessons: newBookmarks });
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const fetchLesson = async () => {
    setLoading(true);
    setStreaming(true);
    setError(null);
    setContent(''); // Clear previous content
    try {
      await geminiService.generateLessonStream(topic, difficulty, (chunk) => {
        setContent(prev => prev + chunk);
        setLoading(false); // Set loading false as soon as we get the first chunk
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate lesson. Please check your connection.");
      setLoading(false);
    } finally {
      setStreaming(false);
    }
  };

  const handleAskGemini = async () => {
    if (!userQuestion.trim() || isAsking) return;
    setIsAsking(true);
    setAiResponse('');
    try {
      await geminiService.askQuestion(content, userQuestion, (chunk) => {
        setAiResponse(prev => prev + chunk);
      });
      setUserQuestion('');
    } catch (err) {
      console.error(err);
      setAiResponse("I'm sorry, I couldn't process that question right now.");
    } finally {
      setIsAsking(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [topic, difficulty]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between mb-10"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-all hover:-translate-x-1"
        >
          <ChevronLeft size={24} />
          <span className="text-lg tracking-tight">Back to Dashboard</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleToggleBookmark}
            disabled={isBookmarking}
            className={`p-3 transition-all rounded-2xl border ${isBookmarked ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm' : 'text-slate-400 bg-white border-slate-100 hover:text-indigo-600 shadow-sm'}`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
          >
            <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button className="p-3 text-slate-400 bg-white border border-slate-100 rounded-2xl hover:text-indigo-600 transition-all shadow-sm">
            <Share2 size={22} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Column */}
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 p-10 md:p-16 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Neural Learning Path
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1] font-display">{topic}</h1>
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <Clock size={20} className="text-indigo-500" />
                    <span className="text-sm">15 min read</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-bold">
                    <BookOpen size={20} className="text-indigo-500" />
                    <span className="text-sm">Core Concepts</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-slate-400 text-sm font-bold">Difficulty:</span>
                    <select 
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="bg-transparent text-white border-none rounded-lg text-sm font-black outline-none cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                      <option className="bg-slate-900">Beginner</option>
                      <option className="bg-slate-900">Intermediate</option>
                      <option className="bg-slate-900">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-[100px]"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]"></div>
            </div>

            {/* Content Body */}
            <div className="p-10 md:p-16">
              {loading ? (
                <div className="space-y-10 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-10 bg-slate-100 rounded-2xl w-1/3"></div>
                    <div className="h-5 bg-slate-100 rounded-xl w-full"></div>
                    <div className="h-5 bg-slate-100 rounded-xl w-5/6"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 bg-slate-100 rounded-2xl w-1/4"></div>
                    <div className="h-5 bg-slate-100 rounded-xl w-full"></div>
                    <div className="h-5 bg-slate-100 rounded-xl w-full"></div>
                  </div>
                  <div className="h-80 bg-slate-50 rounded-[2.5rem]"></div>
                </div>
              ) : error ? (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-100">
                    <XCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 font-display">Neural Link Failed</h3>
                  <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium text-lg">{error}</p>
                  <button 
                    onClick={fetchLesson}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 mx-auto"
                  >
                    <RefreshCcw size={20} />
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 prose-headings:font-display
                  prose-h1:text-5xl prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                  prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:text-xl prose-p:mb-8
                  prose-strong:text-slate-900 prose-strong:font-bold
                  prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-600 prose-li:text-lg prose-li:mb-4
                  prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2.5 prose-code:py-1 prose-code:rounded-xl prose-code:before:content-none prose-code:after:content-none prose-code:font-bold
                  prose-blockquote:border-l-8 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/40 prose-blockquote:p-10 prose-blockquote:rounded-r-[2.5rem] prose-blockquote:italic prose-blockquote:text-indigo-900 prose-blockquote:text-xl
                 relative">
                  <Markdown>{content}</Markdown>
                  {streaming && (
                    <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] mt-12 py-4 px-6 bg-indigo-50 rounded-2xl w-fit animate-pulse">
                      <Sparkles size={16} className="animate-spin" />
                      Neural Stream Active...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ask Gemini Section */}
          <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Brain size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 font-display">Neural Assistant</h3>
                <p className="text-slate-500 font-medium">Ask anything about this lesson.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <textarea 
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="What would you like to clarify?"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-8 text-lg font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[150px] resize-none"
                />
                <button 
                  onClick={handleAskGemini}
                  disabled={isAsking || !userQuestion.trim()}
                  className="absolute bottom-6 right-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isAsking ? <RefreshCcw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Ask
                </button>
              </div>

              <AnimatePresence>
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50 rounded-[2.5rem] p-10 border border-indigo-100 relative group"
                  >
                    <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-4">
                      <Sparkles size={14} />
                      Gemini's Insight
                    </div>
                    <p className="text-indigo-900 text-lg font-medium leading-relaxed">
                      {aiResponse}
                    </p>
                    <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setAiResponse('')} className="text-indigo-300 hover:text-indigo-600">
                        <XCircle size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
          {/* Quick Insights Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-10">
            <h3 className="text-xl font-black text-slate-900 mb-8 font-display flex items-center gap-3">
              <Sparkles className="text-indigo-600" size={24} />
              Neural Insights
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black">01</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Master core principles before diving into advanced implementation.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black">02</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">AI-driven learning paths adapt to your cognitive retention patterns.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black">03</div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Quizzes validate neural link strength and identify knowledge gaps.</p>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Learning Progress</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-3">
                    <span className="text-slate-600">Retention Rate</span>
                    <span className="text-indigo-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-3">
                    <span className="text-slate-600">Topic Coverage</span>
                    <span className="text-emerald-600">60%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={onComplete}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 group"
              >
                Start Knowledge Check
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LessonView;

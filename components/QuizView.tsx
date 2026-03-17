import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Trophy, 
  Zap, 
  ArrowLeft,
  RefreshCcw,
  Plus,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizViewProps {
  topic: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ topic: initialTopic, onComplete, onBack }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizStarted && !showResult && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
    return () => clearInterval(timer);
  }, [isQuizStarted, showResult, timeLeft]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const questions = await geminiService.generateQuiz(topic, 'Intermediate', 5);
      setQuiz(questions);
      setIsQuizStarted(true);
      setCurrentQuestionIdx(0);
      setScore(0);
      setShowResult(false);
      setTimeLeft(30);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === quiz![currentQuestionIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quiz!.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setIsQuizStarted(false);
    setQuiz(null);
    setTopic('');
    setCurrentQuestionIdx(0);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!isQuizStarted ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full space-y-12 text-center"
          >
            <div className="space-y-6">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="w-24 h-24 rounded-[2.5rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/10"
              >
                <Brain size={48} className="text-indigo-400" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">Neural Quiz Engine</h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
                Challenge your knowledge. Generate an AI-powered quiz on any topic in seconds.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-slate-900 border border-white/10 rounded-[2rem] p-2 flex flex-col sm:flex-row gap-2">
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic (e.g. Photosynthesis, Civil War)"
                  className="flex-1 bg-transparent py-4 px-6 outline-none font-bold text-lg placeholder:text-slate-600"
                />
                <button 
                  onClick={handleGenerateQuiz}
                  disabled={loading || !topic.trim()}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Zap size={18} className="animate-spin" /> : <Zap size={18} />}
                  Generate Quiz
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Math', 'History', 'Science', 'Art'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTopic(t)}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        ) : showResult ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-slate-900 border border-white/5 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl"
          >
            <div className="space-y-4">
              <div className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} className="text-amber-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tight">Quiz Complete!</h2>
              <p className="text-slate-400 font-medium text-lg">You've successfully completed the neural challenge.</p>
            </div>

            <div className="py-8 border-y border-white/5 flex items-center justify-center gap-12">
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</div>
                <div className="text-5xl font-black text-indigo-400">{score}/{quiz?.length}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Accuracy</div>
                <div className="text-5xl font-black text-emerald-400">{Math.round((score / quiz!.length) * 100)}%</div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleRestart}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
              >
                <RefreshCcw size={18} />
                Try Another Topic
              </button>
              <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3">
                Share Results
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl w-full space-y-8"
          >
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleRestart}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {quiz?.length}</div>
                  <h3 className="text-xl font-black tracking-tight">{topic}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                <Timer size={18} className={timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-indigo-400'} />
                <span className={`text-lg font-black tabular-nums ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                  0:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIdx + 1) / quiz!.length) * 100}%` }}
                className="h-full bg-indigo-600"
              />
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                {quiz![currentQuestionIdx].question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {quiz![currentQuestionIdx].options.map((option, idx) => {
                  const isCorrect = idx === quiz![currentQuestionIdx].correctAnswer;
                  const isSelected = selectedOption === idx;
                  const showCorrect = selectedOption !== null && isCorrect;
                  const showWrong = isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={selectedOption !== null}
                      className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left group ${
                        showCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : showWrong 
                            ? 'bg-red-500/10 border-red-500/50 text-red-400'
                            : isSelected
                              ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400'
                              : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <span className="text-lg font-bold">{option}</span>
                      {showCorrect && <CheckCircle2 size={24} />}
                      {showWrong && <XCircle size={24} />}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-8 border-t border-white/5 space-y-4"
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                    <Sparkles size={14} />
                    Neural Explanation
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {quiz![currentQuestionIdx].explanation}
                  </p>
                  <button 
                    onClick={handleNextQuestion}
                    className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestionIdx === quiz!.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizView;

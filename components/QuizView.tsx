
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    
    const isCorrect = selectedOption === questions[currentIdx].correct_answer;
    if (isCorrect) setCorrectCount(prev => prev + 1);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round(((correctCount) / questions.length) * 100);
      onComplete(finalScore);
    }
  };

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let stateClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20';
            const isCorrect = option === currentQuestion.correct_answer;
            const isUserSelection = option === selectedOption;

            if (isAnswered) {
              if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-200 dark:ring-emerald-900/30 animate-success-pop';
              else if (isUserSelection) stateClass = 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 dark:border-rose-600 text-rose-700 dark:text-rose-300';
              else stateClass = 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-50';
            } else if (isUserSelection) {
              stateClass = 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-100 dark:ring-indigo-900/40';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all flex items-center justify-between group active:scale-[0.99] ${stateClass}`}
              >
                <span className="dark:text-slate-100">{option}</span>
                {isAnswered && isCorrect && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {isAnswered && isUserSelection && !isCorrect && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        {isAnswered ? (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-bottom-2"
          >
            <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={checkAnswer}
            disabled={!selectedOption}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${!selectedOption ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none'}`}
          >
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;

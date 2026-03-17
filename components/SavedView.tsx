import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Filter,
  BookOpen,
  Sparkles,
  Clock
} from 'lucide-react';
import Markdown from 'react-markdown';

interface SavedAnswer {
  id: string;
  topic: string;
  content: string;
  date: string;
  subject: string;
}

const SavedView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  
  // Mock data for saved answers
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([
    {
      id: '1',
      topic: 'Quantum Entanglement',
      content: 'Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others.',
      date: '2024-03-15',
      subject: 'Science'
    },
    {
      id: '2',
      topic: 'Pythagorean Theorem',
      content: 'In mathematics, the Pythagorean theorem, also known as Pythagoras\' theorem, is a fundamental relation in Euclidean geometry among the three sides of a right triangle. It states that the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares on the other two sides.',
      date: '2024-03-14',
      subject: 'Math'
    },
    {
      id: '3',
      topic: 'Metaphor vs Simile',
      content: 'A **simile** is a figure of speech that directly compares two things. Similes differ from other metaphors by highlighting the similarities between two things using comparison words such as "like", "as", "so", or "than", while other metaphors create an implicit comparison.',
      date: '2024-03-12',
      subject: 'English'
    }
  ]);

  const filteredAnswers = savedAnswers.filter(ans => {
    const matchesSearch = ans.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ans.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || ans.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: string) => {
    setSavedAnswers(prev => prev.filter(ans => ans.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-400">
              <Bookmark size={24} fill="currentColor" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Knowledge Vault</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Saved Answers</h1>
            <p className="text-slate-500 font-medium text-lg">Your curated collection of AI-powered insights.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-1 rounded-2xl border border-white/5">
            {['All', 'Math', 'Science', 'English'].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSubject === sub ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Search your vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-bold text-lg placeholder:text-slate-700"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnswers.map((ans) => (
              <motion.div
                key={ans.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/[0.07] transition-all hover:border-white/10 flex flex-col gap-6"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      <Sparkles size={12} />
                      {ans.subject}
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{ans.topic}</h3>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors">
                      <Share2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ans.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 line-clamp-4 text-slate-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <Markdown>{ans.content}</Markdown>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {ans.date}
                  </div>
                  <button className="flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                    View Full
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredAnswers.length === 0 && (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-slate-700">
                <BookOpen size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-300">No matches found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedView;

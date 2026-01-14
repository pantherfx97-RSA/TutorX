
import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile, DifficultyLevel, LessonContent, SubscriptionTier, QuizScoreRecord } from './types';
import { mockAuth, mockFirestore } from './services/firebaseService';
import { generateLesson } from './services/geminiService';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LessonView from './components/LessonView';
import UpgradeModal from './components/UpgradeModal';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('tutorx_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Subscription management
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [targetTier, setTargetTier] = useState<SubscriptionTier>(SubscriptionTier.PREMIUM);

  useEffect(() => {
    const checkApiKey = async () => {
      // If process.env.API_KEY is already set, we are good.
      // Otherwise, check the aistudio bridge.
      if (process.env.API_KEY) {
        setHasApiKey(true);
      } else if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(false);
      }
    };
    checkApiKey();

    const stored = mockAuth.getStoredUser();
    if (stored) {
      setUser(stored);
      setCurrentScreen(AppScreen.DASHBOARD);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tutorx_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tutorx_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAuth = async (email: string, pass: string) => {
    setAuthLoading(true);
    setError(undefined);
    try {
      let loggedUser;
      if (currentScreen === AppScreen.REGISTER) {
        loggedUser = await mockAuth.register(email, pass);
      } else {
        loggedUser = await mockAuth.login(email, pass);
      }
      
      if (loggedUser) {
        setUser(loggedUser);
        setCurrentScreen(AppScreen.DASHBOARD);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    mockAuth.logout();
    setUser(null);
    setCurrentScreen(AppScreen.LOGIN);
    setActiveLesson(null);
  };

  const startLearning = async (topic: string, level: DifficultyLevel) => {
    setLoading(true);
    setActiveDifficulty(level);
    try {
      const content = await generateLesson(topic, level);
      setActiveLesson(content);
      setCurrentScreen(AppScreen.LEARNING);
    } catch (err: any) {
      // If the error is about a missing or invalid key, we might need to re-prompt
      if (err.message.includes("Requested entity was not found") || err.message.includes("API Key")) {
        setHasApiKey(false);
      }
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApiKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setHasApiKey(true);
    }
  };

  const completeLesson = async (score: number) => {
    if (!user || !activeLesson) return;
    
    const now = Date.now();
    const isNewDay = !user.lastActiveDate || 
      new Date(user.lastActiveDate).toDateString() !== new Date(now).toDateString();
    
    const newScoreRecord: QuizScoreRecord = {
      topic: activeLesson.topic,
      score: score,
      date: now,
      difficulty: activeDifficulty
    };

    const updatedUser: UserProfile = {
      ...user,
      learningProgress: Math.min(100, user.learningProgress + 5),
      completedTopics: [...new Set([...user.completedTopics, activeLesson.topic])],
      quizScores: [...user.quizScores, newScoreRecord],
      streak: isNewDay ? (user.streak || 0) + 1 : (user.streak || 1),
      lastActiveDate: now
    };
    
    setUser(updatedUser);
    localStorage.setItem('tutorx_user', JSON.stringify(updatedUser));
    await mockFirestore.saveProgress(user.email, updatedUser);
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      const updatedUser = await mockAuth.upgradeTier(tier);
      setUser(updatedUser);
      setShowUpgrade(false);
    } catch (err) {
      alert("Payment failed. Please try again.");
    }
  };

  const triggerUpgrade = (tier: SubscriptionTier) => {
    setTargetTier(tier);
    setShowUpgrade(true);
  };

  const renderContent = () => {
    // If we definitely don't have an API key, show the setup screen
    if (hasApiKey === false) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl text-center space-y-8 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none animate-float">
                <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                  <path d="M14 14L50 50" stroke="white" strokeWidth="10" strokeLinecap="round" />
                  <path d="M50 14L14 50" stroke="white" strokeWidth="10" strokeLinecap="round" strokeOpacity="0.5" />
                </svg>
             </div>
             <div className="space-y-3">
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-50">AI Configuration Required</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                 To curate your masterclasses, TutorX needs access to the Gemini AI Engine. Please select a valid API key from a paid GCP project.
               </p>
             </div>
             <div className="space-y-4">
               <button 
                 onClick={handleSelectApiKey}
                 className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
               >
                 Connect AI Key
               </button>
               <a 
                 href="https://ai.google.dev/gemini-api/docs/billing" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-[0.15em] transition-colors"
               >
                 Billing & Setup Documentation
               </a>
             </div>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className={isDarkMode ? 'dark' : ''}>
           <Auth 
            type={currentScreen} 
            onAuth={handleAuth} 
            onNavigate={setCurrentScreen} 
            loading={authLoading} 
            error={error}
          />
        </div>
      );
    }

    return (
      <Layout 
        userEmail={user.email} 
        onLogout={handleLogout} 
        onNavigate={setCurrentScreen}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      >
        {currentScreen === AppScreen.DASHBOARD && (
          <Dashboard user={user} onStartLearning={startLearning} onTriggerUpgrade={triggerUpgrade} loading={loading} />
        )}
        {currentScreen === AppScreen.LEARNING && activeLesson && (
          <LessonView 
            content={activeLesson} 
            onComplete={completeLesson}
            onNavigate={(topic) => startLearning(topic, DifficultyLevel.BEGINNER)} 
            onTriggerUpgrade={triggerUpgrade}
            onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
            tier={user.tier}
          />
        )}
        {currentScreen === AppScreen.PROFILE && <Profile user={user} />}
      </Layout>
    );
  };

  return (
    <div className="antialiased selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/40 dark:selection:text-indigo-200">
      {renderContent()}
      {showUpgrade && (
        <UpgradeModal 
          targetTier={targetTier} 
          onClose={() => setShowUpgrade(false)} 
          onUpgrade={handleUpgrade} 
        />
      )}
    </div>
  );
};

export default App;

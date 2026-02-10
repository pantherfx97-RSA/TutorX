
import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile, DifficultyLevel, LessonContent, SubscriptionTier, QuizScoreRecord, UserDocument } from './types';
import { mockAuth, mockFirestore } from './services/firebaseService';
import { generateLesson } from './services/geminiService';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LessonView from './components/LessonView';
import UpgradeModal from './components/UpgradeModal';
import LandingPage from './components/LandingPage';
import PlansView from './components/PlansView';
import { DEVELOPER_CREDIT } from './constants';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('tutorx_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [targetTier, setTargetTier] = useState<SubscriptionTier>(SubscriptionTier.PREMIUM);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Splash Screen Logic
  useEffect(() => {
    // Prevent body scroll during splash
    document.body.style.overflow = 'hidden';
    
    const progressTimer = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1.25;
      });
    }, 30);

    const timer = setTimeout(() => {
      setShowSplash(false);
      document.body.style.overflow = 'auto';
    }, 3200);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const stored = mockAuth.getStoredUser();
    if (stored) {
      const resetUser = checkDailyReset(stored);
      setUser(resetUser);
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

  const checkDailyReset = (profile: UserProfile): UserProfile => {
    const now = Date.now();
    const isNewDay = !profile.lastQuestionDate || 
      new Date(profile.lastQuestionDate).toDateString() !== new Date(now).toDateString();
    
    if (isNewDay) {
      return { ...profile, questionsAskedToday: 0 };
    }
    return profile;
  };

  const handleAuth = async (email: string, pass: string) => {
    setAuthLoading(true);
    setError(undefined);
    try {
      let loggedUser;
      if (currentScreen === AppScreen.REGISTER || currentScreen === AppScreen.LANDING) {
        loggedUser = await mockAuth.register(email, pass);
      } else {
        loggedUser = await mockAuth.login(email, pass);
      }
      if (loggedUser) {
        setUser(checkDailyReset(loggedUser));
        setCurrentScreen(AppScreen.DASHBOARD);
      }
    } catch (err) {
      setError('Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    mockAuth.logout();
    setUser(null);
    setCurrentScreen(AppScreen.LANDING);
    setActiveLesson(null);
  };

  const startLearning = async (topic: string, level: DifficultyLevel, academicLevel: string = "High School", examType: string = "Standard") => {
    setLoading(true);
    setActiveDifficulty(level);
    try {
      const fullPrompt = `Subject: ${topic}\nLevel: ${academicLevel}\nExam Type: ${examType}`;
      const content = await generateLesson(fullPrompt, level, user?.tier || SubscriptionTier.FREE);
      setActiveLesson(content);
      setCurrentScreen(AppScreen.LEARNING);
    } catch (err: any) {
      alert(`AI Engine Notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = async (score: number, isMasteryOnly: boolean = false) => {
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
      learningProgress: Math.min(100, user.learningProgress + (isMasteryOnly ? 2 : 5)),
      completedTopics: [...new Set([...user.completedTopics, activeLesson.topic])],
      quizScores: [...user.quizScores, newScoreRecord],
      streak: isNewDay ? (user.streak || 0) + 1 : (user.streak || 1),
      lastActiveDate: now
    };
    setUser(updatedUser);
    localStorage.setItem('tutorx_user', JSON.stringify(updatedUser));
  };

  const handleQuestionAsked = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      questionsAskedToday: user.questionsAskedToday + 1,
      lastQuestionDate: Date.now()
    };
    setUser(updatedUser);
    localStorage.setItem('tutorx_user', JSON.stringify(updatedUser));
  };

  const handleDocumentUpload = (doc: UserDocument) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      uploadedDocuments: [...(user.uploadedDocuments || []), doc]
    };
    setUser(updatedUser);
    localStorage.setItem('tutorx_user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    if (!user) {
      return (
        <LandingPage 
          currentAuthScreen={currentScreen === AppScreen.LANDING ? AppScreen.REGISTER : currentScreen}
          onAuth={handleAuth}
          onNavigate={setCurrentScreen}
          loading={authLoading}
          error={error}
        />
      );
    }

    return (
      <Layout 
        userEmail={user.email} 
        onLogout={handleLogout} 
        onNavigate={setCurrentScreen}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        activeScreen={currentScreen}
      >
        {currentScreen === AppScreen.DASHBOARD && (
          <Dashboard user={user} onStartLearning={startLearning} onTriggerUpgrade={(tier) => { setTargetTier(tier); setShowUpgrade(true); }} loading={loading} />
        )}
        {currentScreen === AppScreen.LEARNING && activeLesson && (
          <LessonView 
            content={activeLesson} 
            onComplete={recordActivity}
            onMarkMastery={(topic) => recordActivity(100, true)}
            onNavigate={(topic) => startLearning(topic, DifficultyLevel.BEGINNER)} 
            onTriggerUpgrade={(tier) => { setTargetTier(tier); setShowUpgrade(true); }}
            onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
            tier={user.tier}
            questionsAskedToday={user.questionsAskedToday}
            onQuestionAsked={handleQuestionAsked}
          />
        )}
        {currentScreen === AppScreen.PROFILE && (
          <Profile 
            user={user} 
            onUpload={handleDocumentUpload} 
            onTriggerUpgrade={(tier) => { setTargetTier(tier); setShowUpgrade(true); }}
            onLogout={handleLogout}
          />
        )}
        {currentScreen === AppScreen.PLANS && (
          <PlansView 
            currentTier={user.tier} 
            onTriggerUpgrade={(tier) => { setTargetTier(tier); setShowUpgrade(true); }}
          />
        )}
      </Layout>
    );
  };

  return (
    <div className="antialiased">
      {/* Premium Neural Splash Screen */}
      {showSplash && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 opacity-80"></div>
          
          <div className="relative group mb-12">
            <div className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse"></div>
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_0_80px_rgba(99,102,241,0.4)] flex items-center justify-center border border-indigo-500/30 transform transition-transform animate-float relative z-10">
              <svg viewBox="0 0 64 64" className="w-20 h-20 sm:w-24 sm:h-24">
                <path d="M18 18L46 46" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
                <path d="M46 18L18 46" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.25" />
                <circle cx="32" cy="32" r="7" fill="#6366f1" className="animate-pulse" />
              </svg>
            </div>
          </div>
          
          <div className="relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
              Tutor<span className="text-indigo-500">X</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400/80">Neural Learning Engine</p>
            
            {/* Progress Bar Container */}
            <div className="w-48 sm:w-64 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden mt-8 border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${splashProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Core... {Math.round(splashProgress)}%</span>
            </div>
          </div>

          <div className="absolute bottom-16 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              {DEVELOPER_CREDIT}
            </p>
            <div className="h-[1px] w-8 bg-slate-800 mx-auto"></div>
          </div>
        </div>
      )}

      {renderContent()}
      
      {showUpgrade && (
        <UpgradeModal 
          targetTier={targetTier} 
          onClose={() => setShowUpgrade(false)} 
          onUpgrade={async (tier) => {
            const upgraded = await mockAuth.upgradeTier(tier);
            setUser(upgraded);
            setShowUpgrade(false);
          }} 
        />
      )}
    </div>
  );
};

export default App;

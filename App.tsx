
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppScreen, UserProfile, DifficultyLevel, LessonContent, SubscriptionTier, QuizScoreRecord } from './types';
import { mockAuth, mockFirestore } from './services/firebaseService';
import { generateLesson } from './services/geminiService';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LessonView from './components/LessonView';
import UpgradeModal from './components/UpgradeModal';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyLevel>(DifficultyLevel.BEGINNER);
  
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
      if (currentScreen === AppScreen.REGISTER || currentScreen === AppScreen.LANDING) {
        loggedUser = await mockAuth.register(email, pass);
      } else {
        loggedUser = await mockAuth.login(email, pass);
      }
      
      if (loggedUser) {
        setUser(loggedUser);
        setCurrentScreen(AppScreen.DASHBOARD);
      }
    } catch (err) {
      setError('Authentication failed. Please check your credentials and try again.');
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

  const startLearning = async (topic: string, level: DifficultyLevel) => {
    setLoading(true);
    setActiveDifficulty(level);
    try {
      const content = await generateLesson(topic, level, user?.tier || SubscriptionTier.FREE);
      setActiveLesson(content);
      setCurrentScreen(AppScreen.LEARNING);
    } catch (err: any) {
      console.error("AI Engine Error:", err);
      alert(`AI Engine Notice: ${err.message || "An error occurred while connecting to the AI engine."}`);
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
    await mockFirestore.saveProgress(user.email, updatedUser);
  };

  const completeLesson = (score: number) => recordActivity(score);
  const markMastery = (topic: string) => recordActivity(100, true);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      const updatedUser = await mockAuth.upgradeTier(tier);
      setUser(updatedUser);
      setShowUpgrade(false);
    } catch (err) {
      alert("Payment verification failed. Please contact support.");
    }
  };

  const triggerUpgrade = (tier: SubscriptionTier) => {
    setTargetTier(tier);
    setShowUpgrade(true);
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
      >
        {currentScreen === AppScreen.DASHBOARD && (
          <Dashboard user={user} onStartLearning={startLearning} onTriggerUpgrade={triggerUpgrade} loading={loading} />
        )}
        {currentScreen === AppScreen.LEARNING && activeLesson && (
          <LessonView 
            content={activeLesson} 
            onComplete={completeLesson}
            onMarkMastery={markMastery}
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
      <Analytics />
    </div>
  );
};

export default App;

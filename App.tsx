
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

const App: React.FC = () => {
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

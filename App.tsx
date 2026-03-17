import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getAuth } from 'firebase/auth';
import { firebaseService } from './services/firebaseService';
import { UserProfile } from './types';

// Components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import UpgradeModal from './components/UpgradeModal';
import MathGuruView from './components/MathGuruView';
import AITutorView from './components/AITutorView';
import PathwayView from './components/PathwayView';
import PlansView from './components/PlansView';
import SplashScreen from './components/SplashScreen';
import ProgressView from './components/ProgressView';
import PrivacyPolicy from './components/PrivacyPolicy';
import SupportView from './components/SupportView';
import PermissionsView from './components/PermissionsView';
import TermsOfService from './components/TermsOfService';
import MasterclassesView from './components/MasterclassesView';
import SavedView from './components/SavedView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import { Sparkles, Brain, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('Landing');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hasSeenPermissions, setHasSeenPermissions] = useState(() => {
    return localStorage.getItem('tutorx_permissions_seen') === 'true';
  });
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const key = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      setApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    // Auto-adjust display settings based on device
    const root = document.documentElement;
    const width = window.innerWidth;
    
    if (width < 640) { // Mobile
      root.style.setProperty('--neural-density', '1.1rem');
    } else if (width < 1024) { // Tablet
      root.style.setProperty('--neural-density', '1rem');
    } else { // Desktop
      root.style.setProperty('--neural-density', '0.9rem');
    }

    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (newWidth < 640) {
        root.style.setProperty('--neural-density', '1.1rem');
      } else {
        root.style.setProperty('--neural-density', '1rem');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initial theme sync
    const savedTheme = localStorage.getItem('tutorx-theme') || 'Dark';
    const applyTheme = (t: string) => {
      const root = document.documentElement;
      if (t === 'Light') {
        root.classList.add('light');
      } else if (t === 'Dark') {
        root.classList.remove('light');
      } else if (t === 'Auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.remove('light');
        } else {
          root.classList.add('light');
        }
      }
    };
    applyTheme(savedTheme);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userProfile = await firebaseService.getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
          setActiveView('Dashboard');
        } else {
          setProfile(null);
          setActiveView('Landing');
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        // Fallback to landing if profile fetch fails
        setActiveView('Landing');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTopicSelect = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    
    let targetView = 'AITutor';
    if (lowerTopic.includes('solve') || lowerTopic.includes('equation') || lowerTopic.includes('math')) {
      targetView = 'MathGuru';
    } else if (lowerTopic.includes('view progress') || lowerTopic.includes('stats')) {
      targetView = 'Progress';
    } else if (lowerTopic.includes('quiz')) {
      const extractedTopic = topic.replace(/quiz me on /i, '').replace(/quiz /i, '');
      setSelectedTopic(extractedTopic || 'General Knowledge');
      setIsQuizMode(true);
      setActiveView('Dashboard');
      return;
    } else if (lowerTopic.includes('plan') || lowerTopic.includes('pathway')) {
      targetView = 'Pathway';
    } else {
      setSelectedTopic(topic);
    }

    // Check permissions for specific views
    if (!hasSeenPermissions && (targetView === 'MathGuru' || targetView === 'AITutor')) {
      setPendingView(targetView);
      setActiveView('Permissions');
    } else {
      setActiveView(targetView);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (user && selectedTopic) {
      await firebaseService.updateProgress(user.uid, selectedTopic);
      const updatedProfile = await firebaseService.getUserProfile(user.uid);
      setProfile(updatedProfile);
    }
    setIsQuizMode(false);
    setSelectedTopic(null);
    setActiveView('Dashboard');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const ApiKeyWarning = () => apiKeyMissing ? (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
      <AlertCircle size={14} />
      Neural Engine Offline: GEMINI_API_KEY is missing in Vercel.
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <ApiKeyWarning />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-pulse shadow-xl shadow-indigo-500/20">
            <Brain size={32} />
          </div>
          <p className="mt-4 text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Neural Data</p>
        </div>
      </div>
    );
  }

  // Auth View
  if (activeView === 'Auth') {
    return (
      <>
        <ApiKeyWarning />
        <Auth onAuthSuccess={() => setActiveView('Dashboard')} />
      </>
    );
  }

  // Landing View
  if (activeView === 'Landing' && !user) {
    return (
      <>
        <ApiKeyWarning />
        <LandingPage 
          onGetStarted={() => setActiveView('Auth')} 
          onPrivacyClick={() => setActiveView('Privacy')} 
          onSupportClick={() => setActiveView('Support')}
          onTermsClick={() => setActiveView('Terms')}
        />
      </>
    );
  }

  if (activeView === 'Privacy' && !user) {
    return <PrivacyPolicy onBack={() => setActiveView('Landing')} />;
  }

  if (activeView === 'Support' && !user) {
    return <SupportView onBack={() => setActiveView('Landing')} />;
  }

  if (activeView === 'Terms' && !user) {
    return <TermsOfService onBack={() => setActiveView('Landing')} />;
  }

  // Authenticated Views
  if (user) {
    if (!profile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-pulse shadow-xl shadow-indigo-500/20">
              <Sparkles size={32} />
            </div>
            <p className="mt-4 text-slate-500 font-black uppercase tracking-widest text-xs">Syncing Neural Profile</p>
          </div>
        </div>
      );
    }

    return (
      <Layout 
        profile={profile} 
        activeView={activeView} 
        onViewChange={setActiveView}
        onUpgradeClick={() => setIsUpgradeModalOpen(true)}
      >
        {apiKeyMissing && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <AlertCircle size={14} />
            Neural Engine Offline: GEMINI_API_KEY is missing in Vercel.
          </div>
        )}
        {activeView === 'Dashboard' && (
          <Dashboard 
            profile={profile} 
            onSelectTopic={handleTopicSelect} 
            onViewChange={setActiveView}
          />
        )}
        {activeView === 'Progress' && (
          <ProgressView profile={profile} />
        )}
        {activeView === 'Lesson' && selectedTopic && (
          <LessonView 
            topic={selectedTopic} 
            userId={user.uid}
            profile={profile}
            onUpdateProfile={setProfile}
            onBack={() => setActiveView('Dashboard')} 
            onComplete={() => setIsQuizMode(true)}
          />
        )}
        {isQuizMode && selectedTopic && (
          <QuizView 
            topic={selectedTopic} 
            onComplete={handleQuizComplete} 
            onBack={() => setIsQuizMode(false)}
          />
        )}
        {activeView === 'Pathway' && <PathwayView />}
        {activeView === 'Masterclasses' && profile && (
          <MasterclassesView profile={profile} onUpdateProfile={setProfile} />
        )}
        {activeView === 'MathGuru' && <MathGuruView initialTopic={selectedTopic} onClearTopic={() => setSelectedTopic(null)} />}
        {activeView === 'AITutor' && (
          <AITutorView 
            initialTopic={selectedTopic} 
            onClearTopic={() => setSelectedTopic(null)} 
            onBack={() => setActiveView('Dashboard')}
          />
        )}
        {activeView === 'Plans' && <PlansView />}
        {activeView === 'Saved' && <SavedView />}
        {activeView === 'Settings' && <SettingsView />}
        {activeView === 'About' && <AboutView onBack={() => setActiveView('Dashboard')} />}
        {activeView === 'Contact' && <ContactView onBack={() => setActiveView('Dashboard')} />}
        {activeView === 'Profile' && (
          <Profile 
            profile={profile} 
            onPrivacyClick={() => setActiveView('Privacy')} 
            onSupportClick={() => setActiveView('Support')}
            onTermsClick={() => setActiveView('Terms')}
            onAboutClick={() => setActiveView('About')}
            onContactClick={() => setActiveView('Contact')}
          />
        )}
        {activeView === 'Privacy' && <PrivacyPolicy onBack={() => setActiveView(user ? 'Profile' : 'Landing')} />}
        {activeView === 'Support' && (
          <SupportView 
            onBack={() => setActiveView(user ? 'Profile' : 'Landing')} 
            userEmail={user?.email || ''}
            userName={profile?.fullName || ''}
          />
        )}
        {activeView === 'Terms' && <TermsOfService onBack={() => setActiveView(user ? 'Profile' : 'Landing')} />}
        {activeView === 'Permissions' && (
          <PermissionsView 
            onComplete={() => {
              setHasSeenPermissions(true);
              localStorage.setItem('tutorx_permissions_seen', 'true');
              if (pendingView) {
                setActiveView(pendingView);
                setPendingView(null);
              } else {
                setActiveView('Dashboard');
              }
            }} 
          />
        )}

        <UpgradeModal 
          isOpen={isUpgradeModalOpen} 
          onClose={() => setIsUpgradeModalOpen(false)} 
        />
      </Layout>
    );
  }

  return <Auth onAuthSuccess={() => setActiveView('Dashboard')} />;
};

export default App;

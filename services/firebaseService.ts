
import { UserProfile, SubscriptionTier } from '../types';

export const mockAuth = {
  currentUser: null as UserProfile | null,
  
  login: async (email: string, pass: string): Promise<UserProfile> => {
    await new Promise(r => setTimeout(r, 1000));
    const stored = localStorage.getItem('tutorx_user');
    const user: UserProfile = stored ? JSON.parse(stored) : {
      email,
      learningProgress: 0,
      completedTopics: [],
      quizScores: [],
      tier: SubscriptionTier.FREE,
      // Fixed: Add required streak property
      streak: 0
    };
    mockAuth.currentUser = user;
    localStorage.setItem('tutorx_user', JSON.stringify(user));
    return user;
  },

  register: async (email: string, pass: string): Promise<UserProfile> => {
    await new Promise(r => setTimeout(r, 1000));
    const user: UserProfile = {
      email,
      learningProgress: 0,
      completedTopics: [],
      quizScores: [],
      tier: SubscriptionTier.FREE,
      // Fixed: Add required streak property
      streak: 0
    };
    mockAuth.currentUser = user;
    localStorage.setItem('tutorx_user', JSON.stringify(user));
    return user;
  },

  upgradeTier: async (tier: SubscriptionTier): Promise<UserProfile> => {
    await new Promise(r => setTimeout(r, 1500)); // Simulate Yoco processing
    if (!mockAuth.currentUser) throw new Error("No user logged in");
    const updatedUser = { ...mockAuth.currentUser, tier };
    mockAuth.currentUser = updatedUser;
    localStorage.setItem('tutorx_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  resetPassword: async (email: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 800));
  },

  logout: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('tutorx_user');
  },

  getStoredUser: (): UserProfile | null => {
    const data = localStorage.getItem('tutorx_user');
    return data ? JSON.parse(data) : null;
  }
};

export const mockFirestore = {
  saveProgress: async (userEmail: string, data: any) => {
    console.log(`Saving progress for ${userEmail}:`, data);
  }
};

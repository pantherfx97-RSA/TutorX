export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface UserProfile {
  email: string;
  fullName: string;
  role: 'Tutor' | 'Student';
  createdAt: any;
  learningProgress: number;
  xp: number;
  completedTopics: string[];
  quizScores: { topic: string; score: number; date: any }[];
  tier: SubscriptionTier;
  streak: number;
  questionsAskedToday: number;
  uploadedDocuments: string[];
  completedMasterclasses: { masterclassId: string; completedLessons: string[] }[];
  bookmarkedLessons?: { topic: string; difficulty: string; date: string }[];
}

export interface Masterclass {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorTitle: string;
  instructorImage?: string;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  modules: MasterclassModule[];
}

export interface MasterclassModule {
  id: string;
  title: string;
  lessons: MasterclassLesson[];
}

export interface MasterclassLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content: string;
  quiz?: Quiz;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Quiz {
  id: string;
  topic: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

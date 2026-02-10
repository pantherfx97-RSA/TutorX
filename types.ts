
export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO'
}

export type TutorMode = 'general' | 'exam' | 'slow' | 'quick' | 'university' | 'eli10' | 'auto';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
}

export interface NextTopic {
  topic: string;
  difficulty: string;
}

export interface LessonContent {
  topic: string;
  lesson: string;
  summary: string[];
  quiz: QuizQuestion[];
  next_topics: NextTopic[];
}

export interface QuizScoreRecord {
  topic: string;
  score: number;
  date: number;
  difficulty: DifficultyLevel;
}

export interface UserDocument {
  name: string;
  type: string;
  data: string;
  date: number;
}

export interface UserProfile {
  email: string;
  displayName?: string;
  learningProgress: number; 
  completedTopics: string[];
  quizScores: QuizScoreRecord[];
  tier: SubscriptionTier;
  streak: number;
  lastActiveDate?: number;
  questionsAskedToday: number;
  lastQuestionDate?: number;
  uploadedDocuments?: UserDocument[];
}

export enum AppScreen {
  LANDING = 'landing',
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot_password',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  LEARNING = 'learning',
  PLANS = 'plans'
}

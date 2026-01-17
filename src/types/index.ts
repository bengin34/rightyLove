// ============================================
// User & Authentication Types
// ============================================

export type AuthProvider = 'email';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ============================================
// Couple & Pairing Types
// ============================================

export interface Couple {
  id: string;
  memberA: string;
  memberB: string;
  createdAt: Date;
  inviteCode: string;
}

export interface PairingState {
  couple: Couple | null;
  partnerId: string | null;
  isPaired: boolean;
}

// ============================================
// Onboarding Types
// ============================================

export type RelationshipType = 'dating' | 'married' | 'long-distance';
export type RelationshipDuration = '<1' | '1-3' | '3-5' | '5+';

export interface OnboardingData {
  relationshipType: RelationshipType | null;
  duration: RelationshipDuration | null;
  notificationTime: Date | null;
  isComplete: boolean;
}

// ============================================
// Photo Types (Local)
// ============================================

export interface Photo {
  id: string;
  localUri: string;
  createdAt: Date;
  likedAt?: Date;
  sharedAt?: Date;
  lastShownAt?: Date;
}

export interface PhotoDeckState {
  photos: Photo[];
  currentIndex: number;
  todayLikedCount: number;
  todaySharedCount: number;
}

// ============================================
// Daily Question Types
// ============================================

export type QuestionStatus = 'not_answered' | 'waiting' | 'unlocked' | 'missed';

export interface Question {
  id: string;
  text: string;
  tags: string[];
}

export interface DailyPrompt {
  coupleId: string;
  dateKey: string; // YYYY-MM-DD
  questionId: string;
  question: Question;
  createdAt: Date;
  unlockedAt?: Date;
}

export interface Answer {
  coupleId: string;
  dateKey: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface DailyQuestionState {
  prompt: DailyPrompt | null;
  myAnswer: Answer | null;
  partnerAnswer: Answer | null;
  status: QuestionStatus;
}

// ============================================
// Mood Types
// ============================================

export type Mood = '🙂' | '😐' | '😞' | '😠' | '😴';

export interface MoodEntry {
  dateKey: string; // YYYY-MM-DD
  mood: Mood;
  createdAt: Date;
}

// ============================================
// Bucket List Types
// ============================================

export type BucketCategory = 'places' | 'things' | 'movies';

export interface BucketItem {
  id: string;
  category: BucketCategory;
  text: string;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================
// Activity & Streak Types
// ============================================

export interface DailyActivity {
  dateKey: string; // YYYY-MM-DD
  didPhoto: boolean;
  didMood: boolean;
  didBucket: boolean;
  didQuestionSubmit: boolean;
  didQuestionUnlock: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  activeDaysThisWeek: number;
  coupleUnlockStreak?: number;
}

// ============================================
// Weekly Recap Types
// ============================================

export interface WeeklyRecap {
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  activeDays: number;
  photosLiked: number;
  photosShared: number;
  questionsAnswered: number;
  questionsUnlocked: number;
  bucketItemsCompleted: number;
  moods: (Mood | null)[];
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DailyResponse {
  prompt: DailyPrompt;
  myStatus: 'not_answered' | 'answered';
  isUnlocked: boolean;
  myAnswer?: Answer;
  partnerAnswer?: Answer;
}

// ============================================
// Notification Types
// ============================================

export interface NotificationSettings {
  enabled: boolean;
  time: Date; // Time of day for daily notification
  timezone: string;
}

// ============================================
// App State Types
// ============================================

export interface AppSettings {
  language: 'en' | 'tr' | 'de' | 'it' | 'fr' | 'es'; // Expandable
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
}

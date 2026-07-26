export type ViewType = 'home' | 'lessons' | 'practice' | 'exam' | 'analytics' | 'admin' | 'mobile';

export type VideoType = 'CORRECT' | 'WRONG';

export interface VideoItem {
  id: string;
  type: VideoType;
  title?: string;
  streamUid: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  durationSec: number;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  questionCount?: number;
}

export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  videoId?: string;
  video?: VideoItem;
}

export interface Question {
  id: number;
  topic: string; // e.g. "Chorrahadan o'tish"
  title: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  hudSimulationType?: 'intersection_unregulated' | 'traffic_light' | 'priority_signs' | 'speed_limit' | 'roundabout';
  simLabel?: string;
  imageUrl?: string;
}

export interface SessionAnswerResult {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  video?: {
    playbackUrl: string;
    durationSec: number;
    type: VideoType;
    title?: string;
  };
  nextQuestionIndex?: number;
}

export interface PracticeStatus {
  todayGoal: number;
  completed: number;
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

export interface LessonModule {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  keyConcepts: { title: string; desc: string }[];
  criticalRule: string;
  simOverlayData: {
    greenTime: string;
    waitTime: string;
    speed: number;
    gear: string;
  };
}

export interface ExamAnswer {
  questionId: number;
  selectedOptionId?: string;
  flagged?: boolean;
}

export interface UserStats {
  totalAttempts: number;
  attemptsThisWeek: number;
  averageScore: number;
  passingThreshold: number;
  timeSpentHours: number;
  examReadinessPercent: number;
  scoreProgression: { day: string; score: number }[];
  recentAttempts: {
    id: number;
    topic: string;
    score: number;
    passed: boolean;
    date: string;
  }[];
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalSessions: number;
  avgScore: number;
}

export interface UserProfile {
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  isLoggedIn: boolean;
  isPremium: boolean;
}


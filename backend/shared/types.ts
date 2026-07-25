export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Category {
  id: string;
  name: Record<string, string>;
  slug: string;
  _count?: { questions: number };
}

export interface Question {
  id: string;
  categoryId: string;
  text: Record<string, string>;
  imageUrl?: string;
  answers: Answer[];
  rawData?: unknown;
}

export interface Answer {
  id: string;
  questionId: string;
  text: Record<string, string>;
  isCorrect: boolean;
  videoId?: string;
  video?: Video;
}

export interface Video {
  id: string;
  type: 'correct' | 'wrong';
  url: string;
  duration: number;
  thumbnailUrl?: string;
}

export interface TestSession {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  startedAt: string;
  finishedAt?: string;
  score?: number;
  _count?: { answers: number };
}

export interface TestSessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  videoId?: string;
  answeredAt: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  videoUrl: string | null;
  videoDuration: number;
}

export interface TestResult {
  score: number;
  total: number;
  passed: boolean;
}

export interface AdminStats {
  categories: number;
  questions: number;
  answers: number;
  videos: number;
  testSessions: number;
  users: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

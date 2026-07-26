export type Role = 'USER' | 'ADMIN';
export type VideoType = 'CORRECT' | 'WRONG';

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect?: boolean;
  videoId?: string | null;
  video?: Video | null;
}

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  imageUrl?: string | null;
  order: number;
  answers: Answer[];
}

export interface Video {
  id: string;
  type: VideoType;
  title?: string | null;
  streamUid: string;
  playbackUrl: string;
  thumbnailUrl?: string | null;
  durationSec: number;
  status: string;
  createdAt?: string | Date;
}

export interface TestSession {
  id: string;
  userId: string;
  categoryId: string;
  startedAt: string | Date;
  finishedAt?: string | Date | null;
  totalScore?: number | null;
  totalCount?: number | null;
}

export interface TestSessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  answeredAt: string | Date;
}

// API DTO & Response interfaces
export interface StartSessionResponse {
  sessionId: string;
  categoryId: string;
  question: Question | null;
  total: number;
}

export interface AnswerQuestionResponse {
  isCorrect: boolean;
  video: {
    playbackUrl: string;
    durationSec: number;
    type: VideoType;
  } | null;
  nextQuestion: Question | null;
}

export interface FinishSessionResponse {
  score: number;
  total: number;
  percentage: number;
}

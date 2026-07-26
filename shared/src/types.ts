export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum VideoType {
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
}

export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  imageUrl?: string | null;
  order: number;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
  video?: Video | null;
}

export interface Video {
  id: string;
  type: VideoType;
  title?: string | null;
  playbackUrl: string;
  thumbnailUrl?: string | null;
  durationSec: number;
  status: string;
}

export interface TestSession {
  id: string;
  userId: string;
  categoryId: string;
  startedAt: string;
  finishedAt?: string | null;
  totalScore?: number | null;
  totalCount?: number | null;
  answers?: TestSessionAnswer[];
}

export interface TestSessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

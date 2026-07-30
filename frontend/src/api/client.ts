const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api';

const ACCESS_KEY = 'avto.accessToken';
const REFRESH_KEY = 'avto.refreshToken';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  if (!tokens) {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return;
  }
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          setTokens(null);
          return false;
        }
        const data = await res.json();
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return true;
      })
      .catch(() => {
        setTokens(null);
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  skipAuthRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const accessToken = getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && !options.skipAuthRetry && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, { ...options, skipAuthRetry: true });
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error || message;
    } catch {
      // no JSON body
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types matching backend responses ──────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: { questions: number };
}

export interface SceneRoad {
  dir: 'N' | 'S' | 'E' | 'W';
  lanes_in: number;
  lanes_out: number;
  priority: 'main' | 'secondary' | 'equal';
}

export interface SceneSign {
  at: string;
  code: string;
}

export interface SceneActor {
  id: string;
  kind: 'car' | 'tram' | string;
  role?: 'player' | string;
  from: string;
  to: string;
  color?: string;
}

export interface SceneData {
  type: string;
  roads: SceneRoad[];
  signs?: SceneSign[];
  markings?: { type: string; at: string }[];
  lights?: { at: string; state: string }[];
  tram_track?: { along: string };
  conditions?: { time: string; weather: string };
}

export interface SceneOutcome {
  status: 'safe' | 'collision' | 'priority_violation' | 'fail';
  order?: string[];
  collideWith?: string;
  ruleCode?: string;
  ruleText?: string;
}

export interface ApiAnswer {
  id: string;
  text: string;
}

export interface ApiQuestion {
  id: string;
  text: string;
  imageUrl?: string | null;
  order: number;
  answers: ApiAnswer[];
  scene: SceneData | null;
  actors: SceneActor[] | null;
}

export interface PracticeCheckResult {
  isCorrect: boolean;
  correctAnswerId: string | null;
  video: { playbackUrl: string; durationSec: number; type: 'CORRECT' | 'WRONG' } | null;
  scene: SceneOutcome | null;
}

export interface TestStartResponse {
  sessionId: string;
  categoryId: string;
  question: ApiQuestion | null;
  total: number;
}

export interface TestAnswerResponse {
  isCorrect: boolean;
  video: { playbackUrl: string; durationSec: number; type: 'CORRECT' | 'WRONG' } | null;
  scene: SceneOutcome | null;
  nextQuestion: ApiQuestion | null;
}

export interface TestFinishResponse {
  score: number;
  total: number;
  percentage: number;
}

export interface TestHistoryItem {
  id: string;
  categoryId: string;
  startedAt: string;
  finishedAt: string | null;
  totalScore: number | null;
  totalCount: number | null;
  category: { id: string; name: string };
  _count: { answers: number };
}

export interface LessonSection {
  heading: string;
  content: string;
  signs?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  readTime: string;
  ruleCode: string;
  sections: LessonSection[];
}

export interface AdminStats {
  users: number;
  questions: number;
  answers: number;
  categories: number;
  videos: number;
  testSessions: number;
  avgScore: number;
}

export interface AdminAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AdminQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  order: number;
  answers: AdminAnswer[];
}

export interface AdminVideo {
  id: string;
  type: 'CORRECT' | 'WRONG';
  title: string | null;
  streamUid: string;
  playbackUrl: string;
  durationSec: number;
  status: string;
  createdAt: string;
  _count: { answers: number };
}

// ── API surface ────────────────────────────────────────────────────

export const authApi = {
  /** identifier can be an email address or a phone number */
  register: (name: string, identifier: string, password: string) => {
    const isEmail = identifier.includes('@');
    return request<{ user: ApiUser; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: { name, password, email: isEmail ? identifier : undefined, phone: isEmail ? undefined : identifier },
    });
  },
  /** identifier can be an email address or a phone number */
  login: (identifier: string, password: string) =>
    request<{ user: ApiUser; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    }),
  logout: () =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST', body: { refreshToken: getRefreshToken() } }),
  me: () => request<{ user: ApiUser }>('/users/me'),
};

export const categoriesApi = {
  list: () => request<ApiCategory[]>('/categories'),
  questions: (categoryId: string) => request<ApiQuestion[]>(`/categories/${categoryId}/questions`),
};

export const practiceApi = {
  check: (questionId: string, answerId: string) =>
    request<PracticeCheckResult>('/practice/check', { method: 'POST', body: { questionId, answerId } }),
};

export const testsApi = {
  start: (categoryId: string) => request<TestStartResponse>('/tests/start', { method: 'POST', body: { categoryId } }),
  answer: (sessionId: string, questionId: string, answerId: string) =>
    request<TestAnswerResponse>(`/tests/${sessionId}/answer`, { method: 'POST', body: { questionId, answerId } }),
  finish: (sessionId: string) => request<TestFinishResponse>(`/tests/${sessionId}/finish`, { method: 'POST' }),
  history: () => request<TestHistoryItem[]>('/tests/history'),
};

export const lessonsApi = {
  list: () => request<Lesson[]>('/lessons'),
  get: (id: string) => request<Lesson>(`/lessons/${id}`),
};

export const adminApi = {
  stats: () => request<AdminStats>('/admin/stats'),
  listVideos: () => request<AdminVideo[]>('/admin/videos'),
  getVideoUploadUrl: () => request<{ uploadUrl: string; videoId: string }>('/admin/videos/upload-url', { method: 'POST' }),
  createCategory: (name: string, slug: string, order?: number) =>
    request<ApiCategory>('/categories', { method: 'POST', body: { name, slug, order } }),
  deleteCategory: (id: string) => request<{ ok: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  categoryQuestions: (categoryId: string) => request<AdminQuestion[]>(`/admin/categories/${categoryId}/questions`),
};

export const questionsApi = {
  create: (categoryId: string, text: string, order?: number) =>
    request<AdminQuestion>('/questions', { method: 'POST', body: { categoryId, text, order } }),
  addAnswer: (questionId: string, text: string, isCorrect: boolean) =>
    request<AdminAnswer>(`/questions/${questionId}/answers`, { method: 'POST', body: { text, isCorrect } }),
  delete: (id: string) => request<{ ok: boolean }>(`/questions/${id}`, { method: 'DELETE' }),
};

export { request };

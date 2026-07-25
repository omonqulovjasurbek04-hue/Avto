const API_BASE = '/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('yhq_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  register: (credentials) => request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  listCategories: () => request('/categories'),
  getCategory: (id) => request(`/categories/${id}`),
  getCategoryQuestions: (id) => request(`/categories/${id}/questions`),
  checkAnswer: (questionId, answerId) => request('/practice/check', { method: 'POST', body: JSON.stringify({ questionId, answerId }) }),

  startTest: (categoryId) => request('/tests/start', { method: 'POST', body: JSON.stringify({ categoryId }) }),
  answerQuestion: (sessionId, questionId, answerId) => request(`/tests/${sessionId}/answer`, { method: 'POST', body: JSON.stringify({ questionId, answerId }) }),
  finishTest: (sessionId) => request(`/tests/${sessionId}/finish`, { method: 'POST' }),
  getTestHistory: () => request('/tests/history'),

  listLessons: () => request('/lessons'),
  getLesson: (id) => request(`/lessons/${id}`),

  getAdminStats: () => request('/admin/stats'),

  uploadVideo: async (formData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('yhq_token') : null;
    const res = await fetch(`${API_BASE}/admin/videos/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
  },

  listVideos: () => request('/admin/videos'),
};

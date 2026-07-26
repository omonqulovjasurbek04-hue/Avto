const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://10.0.2.2:4000/api';

function getToken() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('yhq_token');
    }
  } catch {}
  return null;
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/me'),

  listCategories: () => request('/categories'),
  getCategoryQuestions: (id) => request(`/categories/${id}/questions`),

  startTest: (categoryId) => request('/tests/start', { method: 'POST', body: JSON.stringify({ categoryId }) }),
  answerQuestion: (sessionId, questionId, answerId) =>
    request(`/tests/${sessionId}/answer`, { method: 'POST', body: JSON.stringify({ questionId, answerId }) }),
  finishTest: (sessionId) => request(`/tests/${sessionId}/finish`, { method: 'POST' }),
  getTestHistory: () => request('/tests/history'),
};

// Central API client for AVTO platform (Next.js)

const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://127.0.0.1:4000/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('yhq_token') : null;
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

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (credentials) => request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Scenarios
  listScenarios: (topic) => request(`/scenarios${topic ? `?topic=${topic}` : ''}`),
  getScenario: (id) => request(`/scenarios/${id}`),
  getScenarioInfo: (id) => request(`/scenarios/${id}/info`),
  getScenarioFrame: (id, t, option) => request(`/scenarios/${id}/frame?t=${t}${option ? `&option=${option}` : ''}`),

  // Lessons
  listLessons: () => request('/lessons'),
  getLesson: (id) => request(`/lessons/${id}`),

  // Progress
  getProgress: () => request('/progress'),
  getProgressStats: () => request('/progress/stats'),
  saveAnswer: (scenarioId, optionId) => request('/progress/answer', { method: 'POST', body: JSON.stringify({ scenarioId, optionId }) }),

  // Exams
  generateExam: () => request('/exams/generate'),
  submitExam: (answers, durationSeconds) => request('/exams/submit', { method: 'POST', body: JSON.stringify({ answers, durationSeconds }) }),
  getExamHistory: () => request('/exams/history'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  validateContent: () => request('/admin/validate'),
  saveScenario: (data) => request('/admin/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  deleteScenario: (id) => request(`/admin/scenarios/${id}`, { method: 'DELETE' }),
  saveLesson: (data) => request('/admin/lessons', { method: 'POST', body: JSON.stringify(data) }),
  deleteLesson: (id) => request(`/admin/lessons/${id}`, { method: 'DELETE' }),
};

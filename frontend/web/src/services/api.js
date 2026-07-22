const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => request('/health'),

  scenarios: {
    list: (params) => {
      const q = new URLSearchParams(params).toString();
      return request(`/scenarios${q ? '?' + q : ''}`);
    },
    get: (id) => request(`/scenarios/${id}`),
    info: (id) => request(`/scenarios/${id}/info`),
    frame: (id, t, option) => {
      const q = new URLSearchParams({ t: String(t ?? 0), ...(option ? { option } : {}) });
      return request(`/scenarios/${id}/frame?${q}`);
    },
  },

  lessons: {
    list: () => request('/lessons'),
    get: (id) => request(`/lessons/${id}`),
  },

  progress: {
    get: (userId) => request(`/progress/${userId}`),
    answer: (userId, scenarioId, optionId) =>
      request(`/progress/${userId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ scenarioId, optionId }),
      }),
  },

  exams: {
    generate: () => request('/exams/generate'),
    submit: (userId, answers, durationSeconds) =>
      request(`/exams/${userId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, durationSeconds }),
      }),
  },

  admin: {
    stats: () => request('/admin/stats'),
    validate: () => request('/admin/validate'),
    saveScenario: (data) =>
      request('/admin/scenarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteScenario: (id) =>
      request(`/admin/scenarios/${id}`, { method: 'DELETE' }),
    saveLesson: (data) =>
      request('/admin/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteLesson: (id) =>
      request(`/admin/lessons/${id}`, { method: 'DELETE' }),
  },
};

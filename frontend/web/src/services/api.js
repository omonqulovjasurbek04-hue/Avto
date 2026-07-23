import { authApi } from '../api/auth.api';
import { scenariosApi } from '../api/scenarios.api';
import { lessonsApi } from '../api/lessons.api';
import { progressApi } from '../api/progress.api';
import { examsApi } from '../api/exams.api';
import { client } from '../api/client';

export { authApi, scenariosApi, lessonsApi, progressApi, examsApi, client };

export const api = {
  health: () => client('/api/health'),
  scenarios: scenariosApi,
  lessons: lessonsApi,
  progress: progressApi,
  exams: examsApi,
  auth: authApi,
  admin: {
    stats: () => client('/api/admin/stats'),
    validate: () => client('/api/admin/validate'),
    saveScenario: (data) =>
      client('/api/admin/scenarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteScenario: (id) =>
      client(`/api/admin/scenarios/${id}`, { method: 'DELETE' }),
    saveLesson: (data) =>
      client('/api/admin/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteLesson: (id) =>
      client(`/api/admin/lessons/${id}`, { method: 'DELETE' }),
  },
};

import { client } from './client';

export const examsApi = {
  generate: () => client('/api/exams/generate'),

  submit: (userId, answers, durationSeconds) =>
    client(`/api/exams/${userId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, durationSeconds }),
    }),
};

import { client } from './client';

export const progressApi = {
  get: (userId = 'user-web') => client(`/api/progress/${userId}`),

  answer: (userId, scenarioId, optionId) =>
    client(`/api/progress/${userId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ scenarioId, optionId }),
    }),
};

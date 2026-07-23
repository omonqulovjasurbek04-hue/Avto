import { client } from './client';

export const lessonsApi = {
  list: () => client('/api/lessons'),
  get: (id) => client(`/api/lessons/${id}`),
};

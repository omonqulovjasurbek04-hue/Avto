import { client } from './client';

export const authApi = {
  register: (data) =>
    client('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    client('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => client('/api/auth/me'),
};

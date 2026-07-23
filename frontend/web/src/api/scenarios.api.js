import { client } from './client';

export const scenariosApi = {
  list: (params) => {
    const q = new URLSearchParams(params).toString();
    return client(`/api/scenarios${q ? '?' + q : ''}`);
  },

  get: (id) => client(`/api/scenarios/${id}`),

  info: (id) => client(`/api/scenarios/${id}/info`),

  frame: (id, t, option) => {
    const q = new URLSearchParams({
      t: String(t ?? 0),
      ...(option ? { option } : {}),
    }).toString();
    return client(`/api/scenarios/${id}/frame?${q}`);
  },
};

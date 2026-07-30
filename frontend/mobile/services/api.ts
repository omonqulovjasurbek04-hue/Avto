import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:4000/api'; // Or local server IP when testing on physical device

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function setStoredTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

export async function clearStoredTokens() {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get access token', error);
  }
  return config;
});

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, { refreshToken })
      .then(async (res) => {
        await setStoredTokens(res.data.accessToken, res.data.refreshToken);
        return true;
      })
      .catch(async () => {
        await clearStoredTokens();
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshed = await tryRefresh();
      if (refreshed) {
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

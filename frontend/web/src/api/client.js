const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function client(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${path.startsWith('/') ? path : '/' + path}`, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // If not already on login page, redirect
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

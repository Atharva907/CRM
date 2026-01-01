const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Refresh access token using HttpOnly cookie
const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  return true;
};

// Make API request with credentials and auto-refresh
const apiRequest = async (url, options = {}) => {
  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    try {
      await refreshAccessToken();
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      });
    } catch (e) {
      throw e;
    }
  }

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = response;
    throw error;
  }

  return response;
};

export const api = {
  get: (url, options = {}) => apiRequest(url, { method: 'GET', ...options }),
  post: (url, data, options = {}) => apiRequest(url, { method: 'POST', body: data ? JSON.stringify(data) : undefined, ...options }),
  put: (url, data, options = {}) => apiRequest(url, { method: 'PUT', body: data ? JSON.stringify(data) : undefined, ...options }),
  delete: (url, options = {}) => apiRequest(url, { method: 'DELETE', ...options }),
};

export const authUtils = {
  // No-op placeholders retained for minimal changes; tokens now use HttpOnly cookies
  refreshAccessToken,
};

export const handleApiResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

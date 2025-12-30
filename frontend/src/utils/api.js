const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Get refresh token from localStorage
const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

// Set auth tokens in localStorage
const setAuthTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Remove auth tokens from localStorage
const removeAuthTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    // Update access token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return data.accessToken;
  } catch (error) {
    // If refresh fails, remove tokens and redirect to login
    removeAuthTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
};

// Make API request with authentication
const apiRequest = async (url, options = {}) => {
  // Get access token
  let token = getAuthToken();

  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the initial request
  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      headers.Authorization = `Bearer ${token}`;

      // Retry the request with new token
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
    } catch (error) {
      throw error;
    }
  }

  return response;
};

// API request methods
export const api = {
  get: (url, options = {}) => apiRequest(url, { method: 'GET', ...options }),
  post: (url, data, options = {}) => apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  }),
  put: (url, data, options = {}) => apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  }),
  delete: (url, options = {}) => apiRequest(url, { method: 'DELETE', ...options }),
};

// Auth utilities
export const authUtils = {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  removeAuthTokens,
  refreshAccessToken,
};

// Helper function to handle API responses
export const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

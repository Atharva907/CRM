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
      // Fix SSL error in development
      agent: false,
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
    // Only remove tokens and redirect if refresh token is completely invalid
    // This ensures users stay logged in unless tokens are completely invalid
    if (error.message === 'No refresh token available' || 
        error.message === 'Failed to refresh token' ||
        error.message === 'Invalid refresh token') {
      removeAuthTokens();
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
    // Fix SSL error in development
    agent: false,
  });

  // If unauthorized, try to refresh token and retry once
  // Skip token refresh for login and register endpoints
  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    try {
      token = await refreshAccessToken();
      headers.Authorization = `Bearer ${token}`;

      // Retry the request with new token
      response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
        // Fix SSL error in development
        agent: false,
      });
    } catch (error) {
      // Only redirect to login if refresh token is invalid
      // This ensures users stay logged in unless tokens are completely invalid
      if (error.message === 'No refresh token available' || 
          error.message === 'Failed to refresh token') {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
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

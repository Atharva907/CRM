"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authUtils, api } from '../utils/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render using cookies
  useEffect(() => {
    const loadUser = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
        const response = await api.get('/auth/me');
        const data = await response.json();
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: { user: { ...data.data, id: data.data._id || data.data.id } } });
      } catch (error) {
        if (error.status === 401) {
          try {
            await authUtils.refreshAccessToken();
            const response = await api.get('/auth/me');
            const data = await response.json();
            dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: { user: { ...data.data, id: data.data._id || data.data.id } } });
            return;
          } catch (refreshError) {
            // fall through to unauthenticated state
          }
        }
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'Unauthenticated' });
      }
    };
    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      const response = await api.post('/auth/login', { email, password });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || 'Login failed';
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: msg });
        return { success: false, message: msg };
      }
      const data = await response.json();
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: data.user } });
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Register function
  const register = async (name, email, password, role) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      const response = await api.post('/auth/register', { name, email, password, role });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || 'Registration failed';
        dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: msg });
        return { success: false, message: msg };
      }
      const data = await response.json();
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: { user: data.user } });
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ignore
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Value provided to context consumers
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

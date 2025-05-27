import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Authentication service
 */
const authService = {
  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise with registration response
   */
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  },

  /**
   * Login user
   * @param email User email
   * @param password User password
   * @returns Promise with login response including tokens and user data
   */
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    
    // Store tokens and user data
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    // Try to revoke token on server if we have a token and user
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');
    
    if (refreshToken || sessionId) {
      try {
        const token = localStorage.getItem('accessToken');
        
        await axios.post(
          `${API_URL}/api/auth/logout`,
          { refreshToken, sessionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    
    // Clear local storage regardless of server response
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from local storage
   * @returns Current user or null
   */
  getCurrentUser: () => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Refresh access token
   * @returns Promise with new tokens
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Get current user profile from API
   * @returns Promise with user profile
   */
  getUserProfile: async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Request password reset
   * @param email User email
   * @returns Promise with response
   */
  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param token Reset token
   * @param password New password
   * @returns Promise with response
   */
  resetPassword: async (token: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, { token, password });
    return response.data;
  },
};

export default authService;
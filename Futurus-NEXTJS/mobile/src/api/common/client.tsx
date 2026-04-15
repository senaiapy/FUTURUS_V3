import Env from '@env';
import axios from 'axios';

import { signOut } from '@/lib/auth';
import { getToken } from '@/lib/auth/utils';

export const client = axios.create({
  baseURL: Env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add JWT token
client.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token?.access) {
      config.headers.Authorization = `Bearer ${token.access}`;
    }
    else {
      // Remove Authorization header if no token (for public endpoints)
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle data unwrapping and errors
client.interceptors.response.use(
  (response) => {
    // NestJS Backend wraps response in { success: true, message: "...", data: { ... } }
    // Laravel Backend wraps response in { status: "success", remark: "...", data: { ... } }
    // We want to return the inner data to the hooks
    if (response.data) {
      // Handle Laravel error response (HTTP 200 but status: 'error')
      if (response.data.status === 'error') {
        const errorMsg = response.data.message?.error?.[0] || response.data.remark || 'Unknown error';
        const error = new Error(errorMsg) as any;
        error.response = response;
        error.isLaravelError = true;
        throw error;
      }
      // Handle NestJS format
      if (response.data.success === true && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
        };
      }
      // Handle Laravel format
      if (response.data.status === 'success' && response.data.data !== undefined) {
        return {
          ...response,
          data: response.data.data,
        };
      }
    }
    return response;
  },
  async (error) => {
    if (
      (error.message === 'Network Error'
        || error.code === 'ERR_NETWORK'
        || error.code === 'ECONNABORTED'
        || !error.response)
      && typeof window !== 'undefined'
    ) {
      // Handle network errors (e.g., no internet connection)
      // You might want to show a toast or a specific error message
      console.error('Network Error or No Response:', error);
    }

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      signOut();
    }
    return Promise.reject(error);
  },
);

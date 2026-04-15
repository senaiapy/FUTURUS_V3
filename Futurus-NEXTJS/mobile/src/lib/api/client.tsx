import axios from 'axios';
import { API_BACKEND_TYPE, API_BASE_URL, getApiConfig } from './config';

/**
 * Axios client configured for API requests
 * Supports dynamic switching between NestJS and Laravel backends
 */

const apiConfig = getApiConfig();

export const client = axios.create({
  baseURL: API_BASE_URL,
});

// Log the current backend configuration for debugging
if (__DEV__) {
  console.log('API Client Configuration:');
  console.log('  Backend:', API_BACKEND_TYPE);
  console.log('  Base URL:', API_BASE_URL);
}

export { API_BACKEND_TYPE, API_BASE_URL, apiConfig };

/**
 * API Configuration
 * Supports switching between NestJS and Laravel backends
 */

export type BackendType = 'next' | 'laravel';

export type ApiConfig = {
  baseURL: string;
  backend: BackendType;
};

// Get the backend type from environment
export function getBackendType(): BackendType {
  // Must be EXPO_PUBLIC_ prefixed to be accessible in the Expo bundle
  const apiType = process.env.EXPO_PUBLIC_API || 'laravel';
  return apiType as BackendType;
}

// API Configuration based on backend type
// EXPO_PUBLIC_API_URL is the single source of truth, set in .env
const API_CONFIGS: Record<BackendType, ApiConfig> = {
  next: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
    backend: 'next',
  },
  laravel: {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',
    backend: 'laravel',
  },
};

// Get current API configuration
export function getApiConfig(): ApiConfig {
  const backend = getBackendType();
  return API_CONFIGS[backend] || API_CONFIGS.laravel;
}

// Helper to switch between backends
export function switchBackend(backend: BackendType): ApiConfig {
  // This would require updating the .env file
  // For now, return the config for the requested backend
  console.log(`Switching to ${backend} backend:`, API_CONFIGS[backend]);
  return API_CONFIGS[backend];
}

// Export current base URL for backward compatibility
export const API_BASE_URL = getApiConfig().baseURL;
export const API_BACKEND_TYPE = getApiConfig().backend;

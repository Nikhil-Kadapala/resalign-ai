/**
 * Frontend configuration
 * Centralized place for environment variables and app settings
 */

/**
 * Backend API base URL
 * Defaults to localhost:8000 if VITE_BACKEND_BASE_URL is not set
 */
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  upload: `${BACKEND_BASE_URL}/api/v1/upload`,
  extract: `${BACKEND_BASE_URL}/api/v1/extract`,
  analyze: `${BACKEND_BASE_URL}/api/v1/analyze`,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
  },
} as const;
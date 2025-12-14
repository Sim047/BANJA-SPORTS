// frontend/src/config/api.ts
// Centralized API configuration to handle environment variables correctly

const getBaseURL = (): string => {
  const envURL = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is set, use it
  if (envURL) {
    // Remove trailing slash
    return envURL.replace(/\/$/, '');
  }
  
  // Default for local development
  return 'http://localhost:5000';
};

export const BASE_URL = getBaseURL();
export const API_URL = `${BASE_URL}/api`;

// Export for backward compatibility
export const API = BASE_URL;

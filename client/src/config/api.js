// API configuration for local development and production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path) => {
  // In production, use the full Railway URL
  // In development, paths like '/api/...' will be proxied by Vite
  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;

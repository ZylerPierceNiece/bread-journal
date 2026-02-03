// API utility for making requests that work in both development and production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Custom fetch that automatically adds the base URL in production
export const apiFetch = (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return fetch(fullUrl, options);
};

export default apiFetch;

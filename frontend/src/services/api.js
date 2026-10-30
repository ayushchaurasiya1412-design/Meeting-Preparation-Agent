import axios from "axios";

// Base URL comes from .env (VITE_API_URL)
// In dev: http://127.0.0.1:8000
// In prod: https://your-api-domain.com
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Export base URL so components can build direct URLs (e.g. image src, PDF links)
export const API_URL = BASE_URL;

export default api;

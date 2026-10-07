import axios from "axios";

let rawBaseURL = import.meta.env.VITE_API_URL || "/api";
if (rawBaseURL !== "/api" && !rawBaseURL.endsWith("/api")) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, "") + "/api";
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(e);
  },
);

export default api;

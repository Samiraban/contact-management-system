import axios from "axios";

const api = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("cms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !String(error.config?.url || "").includes("/auth/login")) {
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_admin");
    if (window.location.pathname !== "/login") window.location.href = "/login";
  }
  return Promise.reject(error);
});
export function errorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong. Please try again.";
}
export default api;

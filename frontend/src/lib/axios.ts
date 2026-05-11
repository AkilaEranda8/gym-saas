import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: "/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const branchId = sessionStorage.getItem("activeBranchId");
  if (branchId) {
    config.headers["X-Branch-ID"] = branchId;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.debug('[axios] 401 on', error.config?.url, '→ redirect /login');
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

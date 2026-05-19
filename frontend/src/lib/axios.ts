import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios";
import { getAccessToken, authStorage } from "./auth";

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
  const user = authStorage.getUser();
  if (user?.tenantId) {
    config.headers["X-Tenant-ID"] = user.tenantId;
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
      authStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:9090";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token    = await AsyncStorage.getItem("access_token");
  const branchId = await AsyncStorage.getItem("branch_id");
  if (token)    config.headers.Authorization = `Bearer ${token}`;
  if (branchId) config.headers["X-Branch-ID"] = branchId;
  return config;
});

export default api;

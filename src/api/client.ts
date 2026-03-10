import axios from "axios";
import { getStoredTokens, storeTokens, removeStoredTokens } from "../utils/authStorage";
import type { AuthTokens } from "../types/auth";

export const apiClient = axios.create({
  // Swagger UI is served at /api, but the OpenAPI `paths` are rooted at the host (see /api-json).
  baseURL: "https://42bafc8c67e9.ngrok.app",
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const stored = getStoredTokens();
  if (stored?.tokens.accessToken) {
    const token = stored.tokens.accessToken;
    if (config.headers && "set" in config.headers) {
      // AxiosHeaders instance
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      const existing =
        config.headers && typeof config.headers === "object" ? (config.headers as Record<string, unknown>) : {};
      (config.headers as any) = {
        ...existing,
        Authorization: `Bearer ${token}`
      };
    }
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<AuthTokens | null> | null = null;

const refreshTokens = async (): Promise<AuthTokens | null> => {
  const stored = getStoredTokens();
  if (!stored?.tokens.refreshToken) return null;

  const response = await apiClient.post("/auth/refresh-token", {
    refresh_token: stored.tokens.refreshToken
  });

  const nextTokens: AuthTokens = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token ?? stored.tokens.refreshToken
  };

  storeTokens(stored.user, nextTokens);
  return nextTokens;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens()
        .catch(() => {
          removeStoredTokens();
          return null;
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    const tokens = await refreshPromise;
    if (!tokens) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    if (originalRequest.headers && "set" in originalRequest.headers) {
      (originalRequest.headers as any).set("Authorization", `Bearer ${tokens.accessToken}`);
    } else {
      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${tokens.accessToken}`
      };
    }
    return apiClient(originalRequest);
  }
);


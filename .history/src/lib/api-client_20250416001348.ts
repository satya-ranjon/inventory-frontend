import axios from "axios";
import { useAuthStore } from "../stores/auth-store";
import { authService } from "../services/auth-service";

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken, isAccessTokenExpired } = useAuthStore.getState();

    // Only add the token if we have one and it's not expired
    if (accessToken && !isAccessTokenExpired()) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or the request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark the request as retried to prevent infinite loops
    originalRequest._retry = true;

    const { refreshToken, setTokens, logout, isRefreshTokenExpired } =
      useAuthStore.getState();

    // If no refresh token or it's expired, logout and reject
    if (!refreshToken || isRefreshTokenExpired()) {
      logout();
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      const response = await authService.refreshToken(refreshToken);
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      } = response.data;

      // Update the tokens in the store
      setTokens(
        newAccessToken,
        newRefreshToken,
        accessTokenExpiry,
        refreshTokenExpiry
      );

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // If token refresh fails, logout and reject
      logout();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;

import apiClient from "../lib/api-client";
import type { LoginFormValues, RegisterFormValues } from "../lib/schemas";

export const authService = {
  async login(data: LoginFormValues) {
    try {
      const response = await apiClient.post("/auth/login", data);
      // Calculate expiry times from the response or use defaults
      const accessTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
      const refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

      // Log response for debugging
      console.log("Login response:", response.data);

      // Check if response contains the expected structure
      if (!response.data || !response.data.user) {
        console.error("Invalid response structure:", response.data);
        // Try to extract user data from potential nested structures
        let userData = response.data.user;
        let accessToken = response.data.accessToken;
        let refreshToken = response.data.refreshToken;

        // If data is nested inside a 'data' property (common API pattern)
        if (response.data.data) {
          userData = response.data.data.user || response.data.data;
          accessToken = response.data.data.accessToken || accessToken;
          refreshToken = response.data.data.refreshToken || refreshToken;
        }

        return {
          data: {
            user: userData,
            accessToken,
            refreshToken,
            accessTokenExpiry,
            refreshTokenExpiry,
          },
        };
      }

      return {
        data: {
          ...response.data,
          accessTokenExpiry,
          refreshTokenExpiry,
        },
      };
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  async register(data: RegisterFormValues) {
    const response = await apiClient.post("/auth/register", {
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    });

    // If the register endpoint returns tokens, add expiry times
    if (response.data?.accessToken) {
      const accessTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
      const refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

      response.data.accessTokenExpiry = accessTokenExpiry;
      response.data.refreshTokenExpiry = refreshTokenExpiry;
    }

    return response;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });

    // Calculate new expiry times
    const accessTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
    const refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    return {
      data: {
        ...response.data,
        accessTokenExpiry,
        refreshTokenExpiry,
      },
    };
  },

  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data;
  },
};

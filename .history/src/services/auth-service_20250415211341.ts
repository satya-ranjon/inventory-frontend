import apiClient from "../lib/api-client";
import type { LoginFormValues, RegisterFormValues } from "../lib/schemas";

export const authService = {
  async login(data: LoginFormValues) {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterFormValues) {
    const response = await apiClient.post("/auth/register", {
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password,
    });
    return response; // Return the full response object
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
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

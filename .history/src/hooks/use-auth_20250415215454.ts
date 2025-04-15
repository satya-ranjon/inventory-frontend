import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authService } from "../services/auth-service";
import { useAuthStore } from "../stores/auth-store";
import type { LoginFormValues, RegisterFormValues } from "../lib/schemas";
import { useEffect, useCallback } from "react";
import { ApiError } from "../lib/types";
import { toast } from "sonner";

export function useAuth() {
  const navigate = useNavigate();
  const {
    login: storeLogin,
    logout: storeLogout,
    isAuthenticated,
    lastActivity,
    updateLastActivity,
  } = useAuthStore();

  // Check for session timeout
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  const checkSessionTimeout = useCallback(() => {
    if (isAuthenticated && lastActivity) {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
        toast(
          "Session expired. Your session has expired. Please log in again."
        );
        storeLogout();
        navigate("/login");
      }
    }
  }, [isAuthenticated, lastActivity, navigate, storeLogout]);

  // Set up activity tracking
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkSessionTimeout, 60000);

      // Track user activity
      const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
      const handleUserActivity = () => updateLastActivity();

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      return () => {
        clearInterval(interval);
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isAuthenticated, checkSessionTimeout, updateLastActivity]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => authService.login(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      storeLogin({ user, accessToken, refreshToken });

      toast(`Login successful. Welcome back, ${user.name}!`);
      navigate("/dashboard");
    },
    onError: (error: ApiError) => {
      // Check for too many attempts
      if (error.response?.status === 429) {
        toast("Too many attempts. Please try again later.");
      } else {
        toast(
          `Login Failed. ${
            error.response?.data?.message ||
            error.message ||
            "Invalid credentials"
          }`
        );
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormValues) => authService.register(data),
    onSuccess: (response) => {
      const { data: userData } = response;
      storeLogin({
        user: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          _id: userData._id,
        },
        accessToken: "",
        refreshToken: "",
      });

      toast(`Registration successful. Welcome, ${userData.data.name}!`);
      navigate("/dashboard");
    },
    onError: (error: ApiError) => {
      toast(
        `Registration Failed. ${
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
        }`
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      storeLogout();
      navigate("/");

      toast("Logged out. You have been successfully logged out.");
    },
    onError: () => {
      storeLogout();
      navigate("/");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast(
        "Password reset email sent. Check your inbox for password reset instructions."
      );
    },
    onError: (error: ApiError) => {
      toast(
        `Failed to send reset email. ${
          error.message || "An error occurred. Please try again."
        }`
      );
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isForgotPassword: forgotPasswordMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

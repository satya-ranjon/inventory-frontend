import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authService } from "../services/auth-service";
import { useAuthStore } from "../stores/auth-store";
import type { LoginFormValues, RegisterFormValues } from "../lib/schemas";
import { useEffect, useCallback, useRef } from "react";
import { ApiError } from "../lib/types";
import { toast } from "sonner";

export function useAuth() {
  const navigate = useNavigate();
  const refreshTimerRef = useRef<number | null>(null);
  const {
    login: storeLogin,
    logout: storeLogout,
    isAuthenticated,
    lastActivity,
    updateLastActivity,
    refreshToken,
    setTokens,
    isAccessTokenExpired,
    isRefreshTokenExpired,
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

  // Setup token refresh mechanism
  const setupTokenRefresh = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // If we have a valid refresh token and user is authenticated
    if (isAuthenticated && refreshToken && !isRefreshTokenExpired()) {
      // Check if access token needs refresh (refresh it when 90% of its lifetime has elapsed)
      if (isAccessTokenExpired()) {
        // Access token is expired, refresh it immediately
        refreshAccessToken();
      } else {
        const accessTokenExpiryTime = useAuthStore.getState().accessTokenExpiry;
        if (accessTokenExpiryTime) {
          // Calculate time remaining (with 10% buffer)
          const timeRemaining = accessTokenExpiryTime - Date.now();
          const refreshTime = Math.max(timeRemaining - timeRemaining * 0.1, 0);

          // Set timer to refresh before token expires
          refreshTimerRef.current = window.setTimeout(() => {
            refreshAccessToken();
          }, refreshTime);
        }
      }
    }
  }, [
    isAuthenticated,
    refreshToken,
    isAccessTokenExpired,
    isRefreshTokenExpired,
  ]);

  // Function to refresh access token
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken || isRefreshTokenExpired()) {
      storeLogout();
      navigate("/login");
      return;
    }

    try {
      const response = await authService.refreshToken(refreshToken);
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      } = response.data;

      setTokens(
        newAccessToken,
        newRefreshToken,
        accessTokenExpiry,
        refreshTokenExpiry
      );
      setupTokenRefresh(); // Reset the refresh timer
    } catch (error) {
      console.error("Failed to refresh token:", error);
      storeLogout();
      navigate("/login");
    }
  }, [
    refreshToken,
    isRefreshTokenExpired,
    storeLogout,
    navigate,
    setTokens,
    setupTokenRefresh,
  ]);

  // Set up activity tracking and token refresh
  useEffect(() => {
    if (isAuthenticated) {
      // Setup token refresh
      setupTokenRefresh();

      // Session timeout check
      const interval = setInterval(checkSessionTimeout, 60000);

      // Track user activity
      const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];
      const handleUserActivity = () => updateLastActivity();

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      return () => {
        // Clean up
        if (refreshTimerRef.current) {
          window.clearTimeout(refreshTimerRef.current);
        }
        clearInterval(interval);
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [
    isAuthenticated,
    checkSessionTimeout,
    updateLastActivity,
    setupTokenRefresh,
  ]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => authService.login(data),
    onSuccess: (response) => {
      // Add data validation and error handling
      if (!response?.data || !response.data.user) {
        toast("Login Failed. Invalid response from server");
        console.error("Invalid login response:", response);
        return;
      }

      const {
        user,
        accessToken,
        refreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      } = response.data;

      // Additional validation for user object
      if (!user || !user.name || !accessToken || !refreshToken) {
        toast("Login Failed. Missing user data or tokens");
        console.error("Invalid user data in response:", user);
        return;
      }

      storeLogin({
        user,
        accessToken,
        refreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      });

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
      if (userData.accessToken && userData.refreshToken) {
        storeLogin({
          user: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            _id: userData._id,
          },
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          accessTokenExpiry: userData.accessTokenExpiry,
          refreshTokenExpiry: userData.refreshTokenExpiry,
        });
      } else {
        // If the registration doesn't return tokens (e.g., requires email verification)
        toast("Registration successful! Please verify your email to continue.");
        navigate("/login");
        return;
      }

      toast(`Registration successful. Welcome, ${userData.name}!`);
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
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      navigate("/");

      toast("Logged out. You have been successfully logged out.");
    },
    onError: () => {
      storeLogout();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
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
    refreshToken: refreshAccessToken,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isForgotPassword: forgotPasswordMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

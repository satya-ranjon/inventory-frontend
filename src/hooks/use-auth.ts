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
    mutationFn: async (data: LoginFormValues) => {
      try {
        // Add detailed logging to track the login process
        console.log("Starting login request with email:", data.email);
        const response = await authService.login(data);
        console.log("Login response received:", response);
        return response;
      } catch (error) {
        console.error("Login request failed:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      // Add data validation and error handling
      if (!response?.data) {
        toast("Login Failed. Invalid response from server");
        console.error("Invalid login response - missing data:", response);
        return;
      }

      console.log("Processing login success with data:", response.data);

      // The backend might return user data in different structure formats
      // Try to handle common response structures
      let user = response.data.user;
      let accessToken = response.data.accessToken;
      let refreshToken = response.data.refreshToken;
      let accessTokenExpiry = response.data.accessTokenExpiry;
      let refreshTokenExpiry = response.data.refreshTokenExpiry;

      // If data is nested inside 'data' property (common API pattern)
      if (!user && response.data.data) {
        console.log(
          "User data might be nested, checking data property",
          response.data.data
        );
        user = response.data.data.user || response.data.data;
        accessToken = response.data.data.accessToken || accessToken;
        refreshToken = response.data.data.refreshToken || refreshToken;
        accessTokenExpiry =
          response.data.data.accessTokenExpiry || accessTokenExpiry;
        refreshTokenExpiry =
          response.data.data.refreshTokenExpiry || refreshTokenExpiry;
      }

      // Additional validation for user object and tokens
      if (!user || !accessToken || !refreshToken) {
        toast("Login Failed. Missing user data or tokens");
        console.error("Missing critical data:", {
          user,
          accessToken,
          refreshToken,
        });
        return;
      }

      // Make sure user has required properties
      if (!user.name) {
        toast("Login Failed. User data is incomplete");
        console.error("User object missing required properties:", user);
        return;
      }

      // Create default expiry times if not provided
      if (!accessTokenExpiry) {
        accessTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
      }

      if (!refreshTokenExpiry) {
        refreshTokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      }

      // Store login data
      storeLogin({
        user,
        accessToken,
        refreshToken,
        accessTokenExpiry,
        refreshTokenExpiry,
      });

      toast(`Login successful. Welcome back, ${user.name}!`);
      navigate("/");
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
      navigate("/login");

      toast("Logged out. You have been successfully logged out.");
    },
    onError: () => {
      storeLogout();
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      navigate("/login");
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

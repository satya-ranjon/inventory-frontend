import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TUser } from "../types/auth";

interface AuthState {
  user: TUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiry: number | null;
  refreshTokenExpiry: number | null;
  isAuthenticated: boolean;
  lastActivity: number | null;
  setUser: (user: TUser) => void;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    accessExpiry: number,
    refreshExpiry: number
  ) => void;
  login: (userData: {
    user: TUser;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
  }) => void;
  logout: () => void;
  updateLastActivity: () => void;
  isAccessTokenExpired: () => boolean;
  isRefreshTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiry: null,
      refreshTokenExpiry: null,
      isAuthenticated: false,
      lastActivity: null,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken, accessExpiry, refreshExpiry) =>
        set({
          accessToken,
          refreshToken,
          accessTokenExpiry: accessExpiry,
          refreshTokenExpiry: refreshExpiry,
        }),

      login: (userData) =>
        set({
          user: userData.user,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          accessTokenExpiry: userData.accessTokenExpiry,
          refreshTokenExpiry: userData.refreshTokenExpiry,
          isAuthenticated: true,
          lastActivity: Date.now(),
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          accessTokenExpiry: null,
          refreshTokenExpiry: null,
          isAuthenticated: false,
          lastActivity: null,
        }),

      updateLastActivity: () =>
        set({
          lastActivity: Date.now(),
        }),

      isAccessTokenExpired: () => {
        const { accessTokenExpiry } = get();
        if (!accessTokenExpiry) return true;
        return Date.now() >= accessTokenExpiry;
      },

      isRefreshTokenExpired: () => {
        const { refreshTokenExpiry } = get();
        if (!refreshTokenExpiry) return true;
        return Date.now() >= refreshTokenExpiry;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenExpiry: state.accessTokenExpiry,
        refreshTokenExpiry: state.refreshTokenExpiry,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

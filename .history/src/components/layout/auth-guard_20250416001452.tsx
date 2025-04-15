import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/auth-store";
import { useAuth } from "../../hooks/use-auth";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isRefreshTokenExpired } = useAuthStore();
  const { refreshToken } = useAuth();

  useEffect(() => {
    // Check if the user is not authenticated or if the refresh token is expired
    if (!isAuthenticated || isRefreshTokenExpired()) {
      navigate("/");
    }
  }, [isAuthenticated, isRefreshTokenExpired, navigate]);

  return <>{children}</>;
}

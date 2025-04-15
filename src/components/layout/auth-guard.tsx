import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/auth-store";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isRefreshTokenExpired } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || isRefreshTokenExpired()) {
      navigate("/");
    }
  }, [isAuthenticated, isRefreshTokenExpired, navigate]);

  return <>{children}</>;
}

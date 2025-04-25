import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/auth-store";
import { TPermission } from "@/types/auth";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: TPermission;
}

export function PermissionGuard({
  children,
  requiredPermission,
}: PermissionGuardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Admin always has access to everything
    if (user?.role === "admin") {
      return;
    }

    // If a specific permission is required and user doesn't have it, redirect to dashboard
    if (
      requiredPermission &&
      (!user?.permissions || !user.permissions.includes(requiredPermission))
    ) {
      navigate("/dashboard");
    }
  }, [user, requiredPermission, navigate]);

  // Admin always has access
  if (user?.role === "admin") {
    return <>{children}</>;
  }

  // If no specific permission required or user has the permission, render children
  if (
    !requiredPermission ||
    (user?.permissions && user.permissions.includes(requiredPermission))
  ) {
    return <>{children}</>;
  }

  // Otherwise render nothing while redirecting
  return null;
}

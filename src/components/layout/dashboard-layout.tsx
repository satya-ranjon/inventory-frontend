import type React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

import { Button } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { useAuthStore } from "../../stores/auth-store";
import { AuthGuard } from "./auth-guard";
import { TPermission } from "../../types/auth";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
      onClick={onClick}>
      {icon}
      {label}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Check initial window size
    const checkWindowSize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(true);
      } else {
        setIsMobileMenuOpen(false);
      }
    };

    // Run on mount
    checkWindowSize();

    // Add event listener for resize
    window.addEventListener("resize", checkWindowSize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", checkWindowSize);
  }, []);

  // Function to check if user has permission
  const hasPermission = (permission?: TPermission): boolean => {
    // Admin has all permissions
    if (user?.role === "admin") return true;

    // If no specific permission is required
    if (!permission) return true;

    // Check user permissions
    return user?.permissions?.includes(permission) || false;
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
      permission: "dashboard" as TPermission,
    },
    {
      href: "/dashboard/items",
      icon: <Package className="h-5 w-5" />,
      label: "Items",
      permission: "item" as TPermission,
    },
    {
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
      label: "Customers",
      permission: "customer" as TPermission,
    },
    {
      href: "/dashboard/sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Sales Orders",
      permission: "sales" as TPermission,
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      // Everyone has access to their own settings
      permission: undefined,
    },
  ];

  // Filter navigation items based on permissions
  const filteredNavItems = navItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 md:hidden "
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {/* Overlay for mobile when sidebar is open */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - always present but controlled by transform */}
        <aside
          style={{
            transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          }}
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between border-b px-6">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 font-semibold">
                <Package className="h-6 w-6" />
                <span>Inventory System</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            {user && (
              <div className="border-b p-4">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <div className="mt-1 text-xs text-gray-500 capitalize">
                  Role: {user.role}
                </div>
                {user.permissions && user.permissions.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    <span>Permissions: </span>
                    <span className="capitalize">
                      {user.permissions.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <nav className="flex-1 space-y-1 p-4">
              {filteredNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.href}
                />
              ))}
            </nav>
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                onClick={handleLogout}>
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

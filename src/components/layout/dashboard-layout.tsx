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
} from "lucide-react";

import { Button } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { useAuthStore } from "../../stores/auth-store";
import { AuthGuard } from "./auth-guard";

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

  const navItems = [
    {
      href: "/dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/items",
      icon: <Package className="h-5 w-5" />,
      label: "Items",
    },
    {
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
      label: "Customers",
    },
    {
      href: "/dashboard/sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Sales Orders",
    },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 md:hidden z-50"
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
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
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
              </div>
            )}

            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => (
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

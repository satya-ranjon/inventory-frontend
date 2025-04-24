import type React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  Menu,
} from "lucide-react";

import { Button } from "../ui/button";
import { useAuth } from "../../hooks/use-auth";
import { useAuthStore } from "../../stores/auth-store";
import { AuthGuard } from "./auth-guard";
import { Sheet, SheetContent } from "../ui/sheet";

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
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle responsive sidebar behavior
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Set up event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

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

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Inventory System</span>
        </Link>
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
            onClick={closeMobileMenu}
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
    </>
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Always visible if not mobile */}
        {!isMobile && (
          <div className="w-64 bg-white border-r shadow-lg">
            <div className="flex h-full flex-col">
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            className="fixed top-4 left-4 z-30 rounded-md bg-white p-2 shadow-md"
            onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Mobile Sidebar using Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 border-r">
            <div className="flex h-full flex-col">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className={`flex-1 bg-gray-50 ${!isMobile ? "ml-0" : ""}`}>
          {/* Mobile Header */}
          {isMobile && (
            <header className="bg-white p-4 shadow-sm">
              <div className="flex items-center">
                <Package className="mr-2 h-6 w-6" />
              </div>
            </header>
          )}

          {/* Main Content */}
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

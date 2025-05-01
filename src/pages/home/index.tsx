import { useNavigate } from "react-router";
import {
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  ArrowRight,
  Settings,
  LogIn,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Menu,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { TPermission } from "@/types/auth";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to check if user has permission
  const hasPermission = (permission?: TPermission): boolean => {
    // Admin has all permissions
    if (user?.role === "admin") return true;

    // If no specific permission is required
    if (!permission) return true;

    // Check user permissions
    return user?.permissions?.includes(permission) || false;
  };

  // Define feature cards for the homepage
  const featureCards = [
    {
      title: "Dashboard",
      description: "View system metrics, analytics, and performance insights",
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      href: "/dashboard",
      permission: "dashboard" as TPermission,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Inventory Items",
      description: "Manage your product catalog and stock levels",
      icon: <Package className="h-8 w-8 text-green-500" />,
      href: "/dashboard/items",
      permission: "item" as TPermission,
      color: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
    },
    {
      title: "Customers",
      description: "Customer relationship management and profiles",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      href: "/dashboard/customers",
      permission: "customer" as TPermission,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
    },
    {
      title: "Sales Orders",
      description: "Process and track customer orders and transactions",
      icon: <ShoppingCart className="h-8 w-8 text-orange-500" />,
      href: "/dashboard/sales",
      permission: "sales" as TPermission,
      color: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
    },
    {
      title: "Settings",
      description: "Configure your account and system preferences",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      href: "/dashboard/settings",
      permission: undefined,
      color: "from-gray-500 to-gray-600",
      bgLight: "bg-gray-50",
    },
  ];

  // Filter navigation items based on permissions
  const accessibleFeatures = isAuthenticated
    ? featureCards.filter((feature) => hasPermission(feature.permission))
    : [];

  // Key benefits of the system
  const benefits = [
    {
      title: "Streamlined Inventory Management",
      description:
        "Track stock levels, set reorder points, and manage inventory across multiple locations",
      icon: (
        <Package className="h-10 w-10 p-2 rounded-full bg-blue-100 text-blue-600" />
      ),
    },
    {
      title: "Optimized Customer Relationships",
      description:
        "Centralized customer data, order history, and interaction tracking",
      icon: (
        <Users className="h-10 w-10 p-2 rounded-full bg-purple-100 text-purple-600" />
      ),
    },
    {
      title: "Real-time Sales Analytics",
      description:
        "Monitor performance metrics and sales trends with interactive dashboards",
      icon: (
        <BarChart3 className="h-10 w-10 p-2 rounded-full bg-green-100 text-green-600" />
      ),
    },
    {
      title: "Secure Multi-user Access",
      description:
        "Role-based permissions system ensures data security and appropriate access levels",
      icon: (
        <Shield className="h-10 w-10 p-2 rounded-full bg-amber-100 text-amber-600" />
      ),
    },
  ];

  // Testimonials
  const testimonials = [
    {
      quote:
        "This inventory system has revolutionized how we manage our warehouse operations.",
      author: "Sarah Johnson",
      position: "Operations Manager",
      company: "Global Retail Inc.",
    },
    {
      quote:
        "The analytics dashboard gives us insights we never had before. Game changer!",
      author: "Michael Chen",
      position: "Supply Chain Director",
      company: "Tech Solutions Ltd.",
    },
    {
      quote:
        "Customer management features have helped us increase repeat business by 35%.",
      author: "Lisa Rodriguez",
      position: "Sales Manager",
      company: "Premiere Distributors",
    },
  ];

  // Stats
  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "50%", label: "Time Saved" },
    { value: "25%", label: "Error Reduction" },
    { value: "10x", label: "ROI" },
  ];

  // Mobile navigation menu for authenticated users
  const renderMobileMenu = () => {
    if (!isAuthenticated) return null;

    return (
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-full shadow-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-6 w-6" />
        </Button>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", damping: 20 }}>
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <h3 className="text-xl font-bold flex items-center">
                    <Package className="mr-2 h-6 w-6" />
                    Inventory System
                  </h3>
                  {user && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  )}
                </div>

                <nav className="space-y-1 flex-1">
                  {accessibleFeatures.map((feature, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                      onClick={() => {
                        navigate(feature.href);
                        setMobileMenuOpen(false);
                      }}>
                      <div className={`${feature.bgLight} p-2 rounded-md`}>
                        {feature.icon}
                      </div>
                      <span>{feature.title}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Implement logout logic here
                      setMobileMenuOpen(false);
                    }}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Inventory Management System
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Please sign in to access your inventory management dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md px-4">
          <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl">
                Sign In Required
              </CardTitle>
              <CardDescription>
                You need to be logged in to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-blue-100 p-4">
                <LogIn className="h-8 w-8 md:h-12 md:w-12 text-blue-600" />
              </div>
              <p className="text-center text-base md:text-lg">
                Please log in to manage your inventory, track sales, and more.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
                Register
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl px-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-2">
              <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-x-hidden">
      {renderMobileMenu()}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 -z-10" />
        <svg
          className="absolute top-0 left-0 -z-10 w-full h-full opacity-10"
          width="1000"
          height="1000"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="container mx-auto px-4 py-8 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="lg:w-1/2 space-y-4 md:space-y-6 text-center lg:text-left">
              <span className="inline-block px-3 py-1 text-xs md:text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                Enterprise Inventory Solution
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Welcome to Your
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  {" "}
                  Inventory System
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Streamline your inventory operations, manage customers, and
                track sales all in one place with our powerful and intuitive
                system.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard/items")}
                  className="shadow-sm hover:shadow-md transition-shadow">
                  View Inventory
                </Button>
              </div>
            </div>
            <motion.div
              className="lg:w-1/2 mt-8 lg:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="relative h-[250px] sm:h-[300px] lg:h-[400px] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 p-4 md:p-6">
                    {featureCards.slice(0, 4).map((feature, index) => (
                      <motion.div
                        key={index}
                        className={`bg-white p-3 md:p-4 rounded-lg shadow-lg transform cursor-pointer ${
                          index % 2 === 0 ? "rotate-2" : "-rotate-2"
                        } hover:rotate-0 transition-all duration-300`}
                        whileHover={{ y: -5, scale: 1.03 }}
                        onClick={() => navigate(feature.href)}>
                        <div
                          className={`${feature.bgLight} p-2 inline-block rounded-lg mb-2`}>
                          {feature.icon}
                        </div>
                        <p className="text-xs sm:text-sm font-medium">
                          {feature.title}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Welcome Message if logged in */}
      {user && (
        <div className="container mx-auto px-4 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-8 md:mb-12 max-w-3xl mx-auto border border-blue-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="rounded-full bg-blue-100 p-3 flex-shrink-0">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  Welcome back, {user.name}!
                </h2>
                <p className="text-gray-700">
                  Role:{" "}
                  <span className="font-medium capitalize">{user.role}</span>
                </p>
                {user.permissions && user.permissions.length > 0 && (
                  <p className="text-gray-700">
                    Access to:{" "}
                    <span className="font-medium capitalize">
                      {user.permissions.join(", ")}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-blue-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}>
                <p className="text-2xl md:text-4xl font-bold text-blue-200">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-blue-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Key Benefits</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Our inventory management system is designed to optimize your
            operations and drive business growth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex flex-col md:flex-row items-center md:items-start gap-4 bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}>
              <div className="flex-shrink-0">{benefit.icon}</div>
              <div className="text-center md:text-left">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by businesses of all sizes to manage inventory and drive
              growth.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white p-4 md:p-6 rounded-xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm md:text-base text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {testimonial.author}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    {testimonial.position}, {testimonial.company}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Quick Access</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Access your most important tools and features in one place
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {accessibleFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}>
              <Card className="h-full transition-all hover:shadow-lg overflow-hidden border-0">
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <CardHeader className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
                    <div
                      className={`${feature.bgLight} p-3 rounded-lg mb-2 sm:mb-0`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg md:text-xl sm:text-right">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                  <CardDescription className="text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 md:p-6">
                  <Button
                    className="w-full group"
                    variant="outline"
                    onClick={() => navigate(feature.href)}>
                    Access {feature.title}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to optimize your inventory?
            </h2>
            <p className="text-base md:text-xl mb-8 max-w-2xl mx-auto">
              Get started with your dashboard and take control of your business
              operations today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-white text-blue-700 hover:bg-blue-50">
              Go to Dashboard <Zap className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Package className="h-5 w-5 md:h-6 md:w-6 mr-2" />
              <span className="text-white font-semibold">Inventory System</span>
            </div>
            <div className="text-xs md:text-sm">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

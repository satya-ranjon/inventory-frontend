import { Routes, Route } from "react-router";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";
import { CustomersPage } from "./pages/customers/customers-page";
import { CustomerProfile } from "./pages/customers/customer-profile";
import { ItemsPage } from "./pages/items/items-page";
import { SalesPage } from "./pages/sales/sales-page";
import { OrderDetails } from "./pages/sales/order-details";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { SettingsPage } from "./pages/settings/settings-page";
import HomePage from "./pages/home";
import { InitUploadThing } from "./components/ui/init-uploadthing";
import { PermissionGuard } from "./components/layout/permission-guard";

function App() {
  return (
    <>
      <InitUploadThing />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="dashboard">
                <DashboardPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Customer routes */}
        <Route
          path="/dashboard/customers"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="customer">
                <CustomersPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/customers/:id"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="customer">
                <CustomerProfile />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Item routes - simplified to just the list page */}
        <Route
          path="/dashboard/items"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="item">
                <ItemsPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Sales routes */}
        <Route
          path="/dashboard/sales"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="sales">
                <SalesPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/sales/:id"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="sales">
                <OrderDetails />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Order routes */}
        <Route
          path="/dashboard/orders"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="sales">
                <SalesPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/orders/:id"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="sales">
                <OrderDetails />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Invoice routes */}
        <Route
          path="/dashboard/invoices"
          element={
            <DashboardLayout>
              <PermissionGuard requiredPermission="sales">
                <SalesPage />
              </PermissionGuard>
            </DashboardLayout>
          }
        />

        {/* Settings route - all authenticated users can access */}
        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;

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

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />

        {/* Customer routes */}
        <Route
          path="/dashboard/customers"
          element={
            <DashboardLayout>
              <CustomersPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/customers/:id"
          element={
            <DashboardLayout>
              <CustomerProfile />
            </DashboardLayout>
          }
        />

        {/* Item routes - simplified to just the list page */}
        <Route
          path="/dashboard/items"
          element={
            <DashboardLayout>
              <ItemsPage />
            </DashboardLayout>
          }
        />

        {/* Sales routes */}
        <Route
          path="/dashboard/sales"
          element={
            <DashboardLayout>
              <SalesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/sales/:id"
          element={
            <DashboardLayout>
              <OrderDetails />
            </DashboardLayout>
          }
        />

        {/* Order routes */}
        <Route
          path="/dashboard/orders"
          element={
            <DashboardLayout>
              <SalesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/orders/:id"
          element={
            <DashboardLayout>
              <OrderDetails />
            </DashboardLayout>
          }
        />

        {/* Invoice routes */}
        <Route
          path="/dashboard/invoices"
          element={
            <DashboardLayout>
              <SalesPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;

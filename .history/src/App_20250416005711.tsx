import { Routes, Route } from "react-router";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";
import { CustomersPage } from "./pages/customers/customers-page";
import { CustomerFormPage } from "./pages/customers/customer-form-page";
import { ItemsPage } from "./pages/items/items-page";
import { ItemFormPage } from "./pages/items/item-form-page";
import { SalesPage } from "./pages/sales/sales-page";
import { SalesOrderFormPage } from "./pages/sales/sales-order-form-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <div className=""></div>
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
        path="/dashboard/customers/new"
        element={
          <DashboardLayout>
            <CustomerFormPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/customers/:id"
        element={
          <DashboardLayout>
            <CustomerFormPage />
          </DashboardLayout>
        }
      />

      {/* Item routes */}
      <Route
        path="/dashboard/items"
        element={
          <DashboardLayout>
            <ItemsPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/items/new"
        element={
          <DashboardLayout>
            <ItemFormPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/items/:id"
        element={
          <DashboardLayout>
            <ItemFormPage />
          </DashboardLayout>
        }
      />

      {/* Sales Order routes */}
      <Route
        path="/dashboard/sales"
        element={
          <DashboardLayout>
            <SalesPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/sales/new"
        element={
          <DashboardLayout>
            <SalesOrderFormPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/sales/:id"
        element={
          <DashboardLayout>
            <SalesOrderFormPage />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;

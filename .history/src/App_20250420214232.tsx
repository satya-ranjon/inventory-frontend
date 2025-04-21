import { Routes, Route } from "react-router";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";
import { CustomersPage } from "./pages/customers/customers-page";
import { ItemsPage } from "./pages/items/items-page";
import { SalesPage } from "./pages/sales/sales-page";
import { SalesOrderFormPage } from "./pages/sales/sales-order-form-page";
import { InitUploadThing } from "./components/ui/init-uploadthing";

function App() {
  return (
    <>
      <InitUploadThing />
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

        {/* Item routes - simplified to just the list page */}
        <Route
          path="/dashboard/items"
          element={
            <DashboardLayout>
              <ItemsPage />
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
    </>
  );
}

export default App;

import { Routes, Route } from "react-router";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { LoginForm } from "./components/auth/login-form";
import { RegisterForm } from "./components/auth/register-form";

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
            <div className="customers-page">Customers List</div>
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/customers/new"
        element={
          <DashboardLayout>
            <div className="customer-form">New Customer</div>
          </DashboardLayout>
        }
      />
      <Route
        path="/dashboard/customers/:id"
        element={
          <DashboardLayout>
            <div className="customer-form">Edit Customer</div>
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;

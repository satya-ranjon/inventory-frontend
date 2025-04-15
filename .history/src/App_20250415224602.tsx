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
    </Routes>
  );
}

export default App;

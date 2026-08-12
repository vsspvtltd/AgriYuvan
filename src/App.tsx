import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import ProtectedRoute from './components/ProtectedRoute';
import ServicePage from './pages/ServicePage';
import { dashboardServices } from './config/dashboardServices';

function DashboardServiceRoute() {
  const { slug } = useParams();
  const service = dashboardServices.find((item) => item.slug === slug);

  if (!service) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ServicePage titleKey={service.titleKey} descriptionKey={service.descriptionKey} slug={service.slug} />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/language" replace />} />
        <Route path="/language" element={<LanguageSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:slug"
          element={
            <ProtectedRoute>
              <DashboardServiceRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/language" replace />} />
      </Routes>
    </div>
  );
}

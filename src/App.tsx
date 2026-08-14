import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import LoginPage from './pages/LoginPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import AadhaarLoginPage from './pages/AadhaarLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import FarmerDetailsPage from './pages/FarmerDetailsPage';
import VendorDetailsPage from './pages/VendorDetailsPage';
import TraderDetailsPage from './pages/TraderDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingRoute from './components/OnboardingRoute';
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

function RoleDetailsRoute() {
  const { role } = useParams();

  if (role === 'farmer') {
    return <FarmerDetailsPage />;
  } else if (role === 'vendor') {
    return <VendorDetailsPage />;
  } else if (role === 'trader') {
    return <TraderDetailsPage />;
  }

  return <Navigate to="/role-selection" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/language" replace />} />
        <Route path="/language" element={<LanguageSelectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/phone-login" element={<PhoneLoginPage />} />
        <Route path="/otp-verification" element={<OTPVerificationPage />} />
        <Route path="/aadhaar-login" element={<AadhaarLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/role-selection" element={
          <OnboardingRoute>
            <RoleSelectionPage />
          </OnboardingRoute>
        } />
        <Route path="/role-details/:role" element={
          <OnboardingRoute>
            <RoleDetailsRoute />
          </OnboardingRoute>
        } />
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

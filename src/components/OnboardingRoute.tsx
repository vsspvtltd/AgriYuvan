import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#475569' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/phone-login" replace />;
  }

  // If user has completed onboarding (has a role), redirect to dashboard
  if (userProfile && userProfile.role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

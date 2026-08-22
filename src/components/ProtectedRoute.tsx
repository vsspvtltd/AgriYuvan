import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#475569' }}>Loading authentication status...</div>
      </div>
    );
  }

  // Allow access if Firebase is not configured (demo mode)
  if (!auth) {
    console.warn('Firebase not configured - running in demo mode');
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/phone-login" replace />;
  }

  return <>{children}</>;
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

export default function AadhaarLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAadhaarSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    // Validate Aadhaar number (12 digits)
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError(t('auth.invalidAadhaar'));
      return;
    }

    setLoading(true);
    try {
      // NOTE: This is a development/mock interface for Aadhaar authentication.
      // In production, this should integrate with the official Aadhaar authentication API
      // provided by the Government of India (UIDAI) following their security guidelines.
      // 
      // For production implementation:
      // 1. Integrate with official Aadhaar authentication API
      // 2. Use proper encryption and security measures as per UIDAI guidelines
      // 3. Store only masked Aadhaar numbers (e.g., XXXX-XXXX-XXXX)
      // 4. Implement proper consent and privacy mechanisms
      // 5. Follow all government regulations and compliance requirements
      
      // For now, redirect to phone login as Aadhaar integration requires official API access
      setError(t('auth.aadhaarNotImplemented'));
      
      // Simulate delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to phone login as fallback
      navigate('/phone-login');
    } catch (error: any) {
      console.error('Aadhaar authentication failed:', error);
      setError(t('auth.aadhaarAuthFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/phone-login');
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('auth.aadhaarLogin')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>{t('auth.aadhaarVerification')}</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{t('auth.aadhaarSubtitle')}</p>
        </div>

        <div className="auth-note">
          <strong>{t('auth.developmentNote')}:</strong> {t('auth.aadhaarDevNote')}
        </div>

        <form onSubmit={handleAadhaarSubmit} className="grid" style={{ gap: '1rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('auth.aadhaarNumber')}</div>
            <input
              className="input"
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={formatAadhaar(aadhaarNumber)}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              maxLength={14}
              style={{ letterSpacing: '0.05em' }}
            />
          </label>

          {error ? <div style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{error}</div> : null}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleBack}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {t('common.back')}
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || aadhaarNumber.replace(/\D/g, '').length !== 12}
              style={{ flex: 1 }}
            >
              {loading ? t('auth.verifying') : t('auth.verifyAadhaar')}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <div className="auth-divider">
            {t('auth.or')}
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate('/phone-login')}
            style={{ width: '100%' }}
          >
            {t('auth.loginWithMobile')}
          </button>
        </div>
      </section>
    </div>
  );
}

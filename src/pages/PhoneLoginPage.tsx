import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RecaptchaVerifier } from 'firebase/auth';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { auth } from '../services/firebase';

export default function PhoneLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginWithPhone } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved:', response);
          },
          'expired-callback': () => {
            console.error('reCAPTCHA expired');
            setError('reCAPTCHA expired. Please try again.');
          },
        });
        console.log('reCAPTCHA initialized');
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        setError('Failed to initialize reCAPTCHA. Please check Firebase configuration.');
      }
    }

    return () => {
      // Cleanup reCAPTCHA when component unmounts
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
      }
    };
  }, []);

  const handleSendOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    if (!recaptchaVerifierRef.current) {
      setError('reCAPTCHA not initialized. Please refresh the page.');
      return;
    }

    // Validate phone number (10 digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('auth.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const fullPhoneNumber = `+91${cleanPhone}`;
      console.log('Attempting to send OTP to:', fullPhoneNumber);
      await loginWithPhone(fullPhoneNumber, recaptchaVerifierRef.current);
      console.log('OTP sent successfully');
      // Confirmation result is now stored in AuthContext
      navigate('/otp-verification', { state: { phoneNumber: fullPhoneNumber } });
    } catch (error: any) {
      console.error('OTP send failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'auth/too-many-requests') {
        setError(t('auth.tooManyRequests'));
      } else if (error.code === 'auth/invalid-phone-number') {
        setError(t('auth.invalidPhone'));
      } else if (error.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded. Please try again later.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add localhost:3003 to Firebase Console > Authentication > Sign-in method > Phone > Authorized domains.');
      } else if (error.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. Please try again.');
      } else {
        // For development, provide more detailed error info
        const errorMessage = error.message || 'Unknown error';
        setError(`Failed to send OTP: ${errorMessage}. Check console for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAadhaarLogin = () => {
    // Navigate to Aadhaar login page (to be implemented)
    navigate('/aadhaar-login');
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('auth.login')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>{t('auth.welcome')}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>{t('auth.loginSubtitle')}</p>
        </div>
        
        <form onSubmit={handleSendOTP} className="grid" style={{ gap: '1rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('auth.mobileNumber')}</div>
            <div className="phone-input-group">
              <div className="country-code">
                +91
              </div>
              <input
                className="input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                style={{ flex: 1 }}
              />
            </div>
          </label>
          
          {error ? <div style={{ color: '#991b1b', fontSize: '0.9rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>{error}</div> : null}
          
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading || phoneNumber.length !== 10}
          >
            {loading ? t('auth.sendingOTP') : t('auth.sendOTP')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <div className="auth-divider">
            {t('auth.or')}
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleAadhaarLogin}
            style={{ width: '100%' }}
          >
            {t('auth.loginWithAadhaar')}
          </button>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" style={{ display: 'none' }} />
      </section>
    </div>
  );
}

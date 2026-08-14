import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function OTPVerificationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, confirmationResult } = useContext(AuthContext);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const phoneNumber = (location.state as { phoneNumber?: string })?.phoneNumber || '';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if confirmation result exists
    if (!confirmationResult) {
      setError(t('auth.sessionExpired'));
      // Don't auto-navigate, let user click back
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [confirmationResult, t]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit;
      }
    });
    setOtp(newOtp);
    // Focus the last filled input or the first empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError(t('auth.invalidOTP'));
      return;
    }

    if (!confirmationResult) {
      setError(t('auth.sessionExpired'));
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(otpString);
      
      // Navigate to role selection
      navigate('/role-selection', { replace: true });
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError(t('auth.invalidOTP'));
      } else if (error.code === 'auth/code-expired') {
        setError(t('auth.otpExpired'));
      } else {
        setError(t('auth.verificationFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    // Navigate back to phone login to resend OTP
    navigate('/phone-login', { state: { phoneNumber, resend: true } });
  };

  const handleBack = () => {
    navigate('/phone-login');
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('auth.otpVerification')}</div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>{t('auth.enterOTP')}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            {t('auth.otpSentTo')} {phoneNumber}
          </p>
        </div>

        <form onSubmit={handleVerifyOTP} className="grid" style={{ gap: '1.5rem' }}>
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="otp-input"
                required
              />
            ))}
          </div>

          {error ? (
            <div style={{ color: '#b91c1c', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>
          ) : null}

          <div className="timer-display">
            {timeLeft > 0 ? (
              <div>
                {t('auth.otpExpiresIn')} {formatTime(timeLeft)}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                className="btn-link"
              >
                {t('auth.resendOTP')}
              </button>
            )}
          </div>

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
              disabled={loading || otp.join('').length !== 6 || !confirmationResult}
              style={{ flex: 1 }}
            >
              {loading ? t('auth.verifying') : t('auth.verifyAndContinue')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

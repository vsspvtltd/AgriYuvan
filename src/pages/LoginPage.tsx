import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

function mapAuthError(code: string, t: (key: string) => string) {
  switch (code) {
    case 'auth/user-not-found':
      return t('auth.userNotFound');
    case 'auth/wrong-password':
      return t('auth.invalidPassword');
    case 'auth/invalid-email':
      return t('auth.invalidEmail');
    default:
      return t('auth.somethingWentWrong');
  }
}

export default function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error: any) {
      const code = error?.code || '';
      setError(mapAuthError(code, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('common.login')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>{t('common.welcome')}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>{t('common.tagline')}</p>
        </div>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('common.email')}</div>
            <input
              className="input"
              type="email"
              placeholder={t('common.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('common.password')}</div>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('common.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((state) => !state)}
                style={{
                  position: 'absolute',
                  right: '0.9rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: '#475569',
                  cursor: 'pointer',
                }}
                aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('common.login')}
          </button>
        </form>
        <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.8rem' }}>
          <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          <Link to="/register">{t('auth.dontHaveAccount')}</Link>
        </div>
      </section>
    </div>
  );
}

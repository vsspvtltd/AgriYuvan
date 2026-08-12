import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

function mapRegisterError(code: string, t: (key: string) => string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return t('auth.emailExists');
    case 'auth/invalid-email':
      return t('auth.invalidEmail');
    case 'auth/weak-password':
      return t('auth.invalidPassword');
    default:
      return t('auth.somethingWentWrong');
  }
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name || undefined);
      navigate('/dashboard');
    } catch (error: any) {
      const code = error?.code || '';
      setError(mapRegisterError(code, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('auth.createAccount')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>{t('auth.createAccount')}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>{t('common.tagline')}</p>
        </div>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('common.name')}</div>
            <input
              className="input"
              type="text"
              placeholder={t('common.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('common.confirmPassword')}</div>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('common.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('auth.createAccount')}
          </button>
        </form>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/login">{t('auth.alreadyHaveAccount')}</Link>
        </div>
      </section>
    </div>
  );
}

import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

function mapResetError(code: string, t: (key: string) => string) {
  switch (code) {
    case 'auth/user-not-found':
      return t('auth.userNotFound');
    case 'auth/invalid-email':
      return t('auth.invalidEmail');
    default:
      return t('auth.somethingWentWrong');
  }
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage(t('auth.resetEmailSent'));
    } catch (error: any) {
      const code = error?.code || '';
      setError(mapResetError(code, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Logo compact />
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>{t('auth.resetPassword')}</div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>{t('auth.resetPassword')}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>{t('common.login')}</p>
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
          {message ? <div style={{ color: '#15803d' }}>{message}</div> : null}
          {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('common.submit')}
          </button>
        </form>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/login">{t('nav.login')}</Link>
        </div>
      </section>
    </div>
  );
}

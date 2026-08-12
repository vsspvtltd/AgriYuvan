import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Mic, User2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { supportedLanguages, LANGUAGE_STORAGE_KEY } from '../config/languages';
import Logo from './Logo';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const code = event.target.value;
    i18n.changeLanguage(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  };

  return (
    <nav className="navbar">
      <div className="nav-title">
        <Logo compact />
      </div>
      <div className="nav-links">
        <NavLink className="btn btn-secondary" to="/dashboard">
          {t('nav.dashboard')}
        </NavLink>
        <NavLink className="btn btn-secondary" to="/assistant">
          <Mic size={16} style={{ marginRight: '0.4rem' }} /> {t('nav.assistant')}
        </NavLink>
        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          className="input"
          style={{ maxWidth: 180 }}
          aria-label={t('language.selectLanguage')}
        >
          {supportedLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeLabel}
            </option>
          ))}
        </select>
        {user ? (
          <div className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <User2 size={16} />
            {user.displayName || user.email?.split('@')[0] || t('nav.dashboard')}
          </div>
        ) : null}
        {user ? (
          <button className="btn btn-secondary" onClick={() => logout()}>
            <LogOut size={16} style={{ marginRight: '0.35rem' }} /> {t('common.logout')}
          </button>
        ) : (
          <NavLink className="btn btn-primary" to="/login">
            {t('nav.login')}
          </NavLink>
        )}
      </div>
    </nav>
  );
}

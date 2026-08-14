import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sprout } from 'lucide-react';
import { supportedLanguages, LANGUAGE_STORAGE_KEY } from '../config/languages';
import LanguageCard from '../components/LanguageCard';

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const fallback = stored && supportedLanguages.some((language) => language.code === stored) ? stored : 'en';
    return fallback;
  });

  const selectedLanguageOption = useMemo(
    () => supportedLanguages.find((language) => language.code === selectedLanguage),
    [selectedLanguage],
  );

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleContinue = () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    navigate('/phone-login');
  };

  return (
    <div className="container page language-page">
      <section className="hero language-hero">
        <div className="hero-badge">
          <ShieldCheck size={20} color="#166534" />
          <span>{t('common.officialService')}</span>
        </div>
        <div className="hero-content">
          <h1>{t('language.welcomeTitle')}</h1>
          <p>{t('language.welcomeSubtitle')}</p>
        </div>
        <div className="hero-branding">
          <Sprout size={36} color="#166534" />
        </div>
      </section>

      <section className="card auth-card language-card-section">
        <div className="language-heading">
          <div>
            <h2>{t('language.selectLanguage')}</h2>
            <p>{t('language.selectLanguageSubtitle')}</p>
          </div>
        </div>
        <div className="lang-grid">
          {supportedLanguages.map((language) => (
            <LanguageCard
              key={language.code}
              language={language}
              selected={language.code === selectedLanguage}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <div className="language-actions">
          <button className="btn btn-primary" type="button" onClick={handleContinue}>
            {t('common.continue')}
          </button>
        </div>
      </section>

      <section className="language-note card">
        <p>{t('language.languageNote')}</p>
        <p>{selectedLanguageOption?.nativeLabel} – {selectedLanguageOption?.label}</p>
      </section>
    </div>
  );
}

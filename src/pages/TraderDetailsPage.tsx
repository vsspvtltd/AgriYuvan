import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { saveTraderProfile } from '../services/userProfileService';

export default function TraderDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tradingRequirements, setTradingRequirements] = useState('');
  const [cropsOfInterest, setCropsOfInterest] = useState('');
  const [marketLocation, setMarketLocation] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    setError('');
    if (step < 2) {
      setStep(step + 1);
    } else {
      if (!user || !user.email) {
        setError('User not authenticated. Please login again.');
        return;
      }
      setLoading(true);
      try {
        const traderData = {
          name,
          phone,
          tradingRequirements,
          cropsOfInterest,
          marketLocation,
        };
        const language = localStorage.getItem('LANGUAGE_STORAGE_KEY') || 'en';
        await saveTraderProfile(user.uid, user.email, traderData, language);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving trader profile:', error);
        setError('Failed to save trader details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/role-selection');
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return name.trim() !== '' && phone.trim() !== '' && phone.length === 10;
      case 2:
        return tradingRequirements.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {t('trader.title')}
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Step {step} of 2
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  background: s <= step ? '#166534' : '#e2e8f0',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="grid" style={{ gap: '1rem' }}>
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
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('trader.phoneNumber')}</div>
              <input
                className="input"
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
              {phone.length !== 10 && phone.length > 0 && (
                <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {t('trader.phoneValidation')}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid" style={{ gap: '1rem' }}>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('trader.tradingRequirements')}</div>
              <textarea
                className="input"
                placeholder={t('trader.tradingRequirementsPlaceholder')}
                value={tradingRequirements}
                onChange={(e) => setTradingRequirements(e.target.value)}
                rows={3}
                required
                style={{ resize: 'vertical' }}
              />
            </label>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('trader.cropsOfInterest')}</div>
              <textarea
                className="input"
                placeholder={t('trader.cropsOfInterestPlaceholder')}
                value={cropsOfInterest}
                onChange={(e) => setCropsOfInterest(e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </label>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('trader.marketLocation')}</div>
              <input
                className="input"
                type="text"
                placeholder={t('trader.marketLocationPlaceholder')}
                value={marketLocation}
                onChange={(e) => setMarketLocation(e.target.value)}
              />
            </label>
          </div>
        )}

        {error && (
          <div style={{ color: '#991b1b', fontSize: '0.9rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleBack}
            style={{ flex: 1 }}
          >
            {t('common.back')}
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleNext}
            disabled={!validateStep() || loading}
            style={{ flex: 1 }}
          >
            {loading ? t('common.loading') : step === 2 ? (
              <>
                {t('common.submit')}
                <ArrowRight size={16} style={{ marginLeft: '0.5rem', display: 'inline' }} />
              </>
            ) : (
              t('common.next')
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

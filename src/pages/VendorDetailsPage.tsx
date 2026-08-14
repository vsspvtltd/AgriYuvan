import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { saveVendorProfile, Requirement } from '../services/userProfileService';

export default function VendorDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([{ id: '1', description: '' }]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addRequirement = () => {
    setRequirements([...requirements, { id: Date.now().toString(), description: '' }]);
  };

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };

  const updateRequirement = (id: string, value: string) => {
    setRequirements(requirements.map(req => req.id === id ? { ...req, description: value } : req));
  };

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
        const vendorData = {
          name,
          phone,
          requirements,
        };
        const language = localStorage.getItem('LANGUAGE_STORAGE_KEY') || 'en';
        await saveVendorProfile(user.uid, user.email, vendorData, language);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving vendor profile:', error);
        setError('Failed to save vendor details. Please try again.');
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
        return requirements.some(req => req.description.trim() !== '');
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
              {t('vendor.title')}
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
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('vendor.phoneNumber')}</div>
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
                  {t('vendor.phoneValidation')}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('vendor.requirements')}</h3>
              <button
                type="button"
                onClick={addRequirement}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                {t('vendor.addRequirement')}
              </button>
            </div>
            {requirements.map((req, index) => (
              <div key={req.id} className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{t('vendor.requirements')} {index + 1}</strong>
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(req.id)}
                      style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <textarea
                  className="input"
                  placeholder={t('vendor.requirementsPlaceholder')}
                  value={req.description}
                  onChange={(e) => updateRequirement(req.id, e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            ))}
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

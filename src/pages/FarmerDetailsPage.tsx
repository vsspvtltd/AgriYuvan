import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { saveFarmerProfile, LandPlot, CropInfo } from '../services/userProfileService';

export default function FarmerDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAcres, setTotalAcres] = useState('');
  const [landPlots, setLandPlots] = useState<LandPlot[]>([{ id: '1', area: '', location: '', soilType: '', crop: '' }]);
  const [crops, setCrops] = useState<CropInfo[]>([{ id: '1', cropName: '', area: '', season: '', sowingDate: '' }]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const soilTypes = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Laterite Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil'];
  const seasons = ['Kharif', 'Rabi', 'Zaid', 'All Year'];
  const commonCrops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Groundnut', 'Sugarcane', 'Tomato', 'Chilli', 'Brinjal', 'Onion'];

  const addLandPlot = () => {
    setLandPlots([...landPlots, { id: Date.now().toString(), area: '', location: '', soilType: '', crop: '' }]);
  };

  const removeLandPlot = (id: string) => {
    setLandPlots(landPlots.filter(plot => plot.id !== id));
  };

  const updateLandPlot = (id: string, field: keyof LandPlot, value: string) => {
    setLandPlots(landPlots.map(plot => plot.id === id ? { ...plot, [field]: value } : plot));
  };

  const addCrop = () => {
    setCrops([...crops, { id: Date.now().toString(), cropName: '', area: '', season: '', sowingDate: '' }]);
  };

  const removeCrop = (id: string) => {
    setCrops(crops.filter(crop => crop.id !== id));
  };

  const updateCrop = (id: string, field: keyof CropInfo, value: string) => {
    setCrops(crops.map(crop => crop.id === id ? { ...crop, [field]: value } : crop));
  };

  const handleNext = async () => {
    setError('');
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (!user || !user.email) {
        setError('User not authenticated. Please login again.');
        return;
      }
      setLoading(true);
      try {
        const farmerData = {
          name,
          phone,
          totalAcres,
          landPlots,
          crops,
        };
        const language = localStorage.getItem('LANGUAGE_STORAGE_KEY') || 'en';
        await saveFarmerProfile(user.uid, user.email, farmerData, language);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving farmer profile:', error);
        setError('Failed to save farmer details. Please try again.');
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
        return totalAcres.trim() !== '' && parseFloat(totalAcres) > 0;
      case 3:
        return landPlots.every(plot => plot.area.trim() !== '' && plot.location.trim() !== '' && plot.soilType !== '');
      case 4:
        return crops.every(crop => crop.cropName !== '' && crop.area !== '' && crop.season !== '');
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
              {t('farmer.title')}
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Step {step} of 4
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4].map((s) => (
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
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('farmer.phoneNumber')}</div>
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
                  {t('farmer.phoneValidation')}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="grid" style={{ gap: '1rem' }}>
            <label>
              <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('farmer.totalAcres')}</div>
              <input
                className="input"
                type="number"
                placeholder="Enter total land area in acres"
                value={totalAcres}
                onChange={(e) => setTotalAcres(e.target.value)}
                min="0"
                step="0.1"
                required
              />
              {parseFloat(totalAcres) <= 0 && totalAcres !== '' && (
                <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {t('farmer.acresValidation')}
                </div>
              )}
            </label>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('farmer.landDetails')}</h3>
              <button
                type="button"
                onClick={addLandPlot}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                {t('farmer.addPlot')}
              </button>
            </div>
            {landPlots.map((plot, index) => (
              <div key={plot.id} className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <strong>{t('farmer.plot')} {index + 1}</strong>
                  {landPlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLandPlot(plot.id)}
                      style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid" style={{ gap: '0.75rem' }}>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.area')}</div>
                    <input
                      className="input"
                      type="number"
                      placeholder="Area in acres"
                      value={plot.area}
                      onChange={(e) => updateLandPlot(plot.id, 'area', e.target.value)}
                      min="0"
                      step="0.1"
                      required
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.location')}</div>
                    <input
                      className="input"
                      type="text"
                      placeholder="Village/District/State"
                      value={plot.location}
                      onChange={(e) => updateLandPlot(plot.id, 'location', e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.soilType')}</div>
                    <select
                      className="input"
                      value={plot.soilType}
                      onChange={(e) => updateLandPlot(plot.id, 'soilType', e.target.value)}
                      required
                    >
                      <option value="">{t('farmer.selectSoil')}</option>
                      {soilTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.currentCrop')}</div>
                    <select
                      className="input"
                      value={plot.crop}
                      onChange={(e) => updateLandPlot(plot.id, 'crop', e.target.value)}
                    >
                      <option value="">{t('farmer.selectCrop')}</option>
                      {commonCrops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('farmer.multiCropInfo')}</h3>
              <button
                type="button"
                onClick={addCrop}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                {t('farmer.addCrop')}
              </button>
            </div>
            {crops.map((crop, index) => (
              <div key={crop.id} className="card" style={{ padding: '1rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <strong>{t('farmer.crop')} {index + 1}</strong>
                  {crops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCrop(crop.id)}
                      style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid" style={{ gap: '0.75rem' }}>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.cropName')}</div>
                    <select
                      className="input"
                      value={crop.cropName}
                      onChange={(e) => updateCrop(crop.id, 'cropName', e.target.value)}
                      required
                    >
                      <option value="">{t('farmer.selectCrop')}</option>
                      {commonCrops.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.area')}</div>
                    <input
                      className="input"
                      type="number"
                      placeholder="Area in acres"
                      value={crop.area}
                      onChange={(e) => updateCrop(crop.id, 'area', e.target.value)}
                      min="0"
                      step="0.1"
                      required
                    />
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.season')}</div>
                    <select
                      className="input"
                      value={crop.season}
                      onChange={(e) => updateCrop(crop.id, 'season', e.target.value)}
                      required
                    >
                      <option value="">{t('farmer.selectSeason')}</option>
                      {seasons.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('farmer.sowingDate')}</div>
                    <input
                      className="input"
                      type="date"
                      value={crop.sowingDate}
                      onChange={(e) => updateCrop(crop.id, 'sowingDate', e.target.value)}
                    />
                  </label>
                </div>
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
            {loading ? t('common.loading') : step === 4 ? (
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

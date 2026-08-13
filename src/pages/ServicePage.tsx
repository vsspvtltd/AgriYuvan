import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { getCurrentWeather, formatWeatherData } from '../services/weatherService';
import { getMarketPrices, formatMarketPrice, getCommoditySuggestions, getStateSuggestions } from '../services/marketService';
import { analyzeSoil, formatSoilAnalysis } from '../services/soilService';
import { getCropRecommendations, formatCropRecommendations, getSoilTypes } from '../services/cropService';
import { getSeedRecommendations, formatSeedRecommendations, getCropList, getSeasons } from '../services/seedService';
import { getFertilizerRecommendation, formatFertilizerRecommendation, getCropList as getFertilizerCropList } from '../services/fertilizerService';
import { getPesticideGuidance, formatPesticideGuidance, getCropList as getPesticideCropList, getPestList, getDiseaseList } from '../services/pesticideService';
import { getCropMonitoring, formatCropMonitoring, getCropList as getMonitoringCropList } from '../services/cropMonitoringService';

const serviceTips: Record<string, string[]> = {
  'soil-analysis': ['dashboard.soilAnalysis.tip1', 'dashboard.soilAnalysis.tip2'],
  'crop-recommendation': ['dashboard.cropRecommendation.tip1', 'dashboard.cropRecommendation.tip2'],
  'seed-recommendation': ['dashboard.seedRecommendation.tip1', 'dashboard.seedRecommendation.tip2'],
  'fertilizer-guidance': ['dashboard.fertilizerRecommendation.tip1', 'dashboard.fertilizerRecommendation.tip2'],
  'pesticide-guidance': ['dashboard.pesticideRecommendation.tip1', 'dashboard.pesticideRecommendation.tip2'],
  'weather': ['dashboard.weather.tip1', 'dashboard.weather.tip2'],
  'market-prices': ['dashboard.marketPrices.tip1', 'dashboard.marketPrices.tip2'],
  'crop-monitoring': ['dashboard.cropMonitoring.tip1', 'dashboard.cropMonitoring.tip2'],
};


export default function ServicePage({
  titleKey,
  descriptionKey,
  slug,
}: {
  titleKey: string;
  descriptionKey: string;
  slug: string;
}) {
  const { t, i18n } = useTranslation();
  const tips = serviceTips[slug] ?? ['dashboard.generalTip1', 'dashboard.generalTip2'];
  
  // Service-specific state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Weather service state
  const [weatherLocation, setWeatherLocation] = useState('');

  // Market service state
  const [marketCommodity, setMarketCommodity] = useState('');
  const [marketState, setMarketState] = useState('');
  const [marketDistrict, setMarketDistrict] = useState('');

  // Soil analysis state
  const [soilPh, setSoilPh] = useState('');
  const [soilNitrogen, setSoilNitrogen] = useState('');
  const [soilPhosphorus, setSoilPhosphorus] = useState('');
  const [soilPotassium, setSoilPotassium] = useState('');
  const [soilOrganicCarbon, setSoilOrganicCarbon] = useState('');
  const [soilType, setSoilType] = useState('');

  // Crop recommendation state
  const [cropState, setCropState] = useState('');
  const [cropSeason, setCropSeason] = useState('Kharif');
  const [cropSoilType, setCropSoilType] = useState('');
  const [cropWaterAvailability, setCropWaterAvailability] = useState('Medium');
  const [cropIrrigation, setCropIrrigation] = useState(false);

  // Seed recommendation state
  const [seedCrop, setSeedCrop] = useState('');
  const [seedState, setSeedState] = useState('');
  const [seedSeason, setSeedSeason] = useState('Kharif');
  const [seedIrrigation, setSeedIrrigation] = useState(false);

  // Fertilizer guidance state
  const [fertCrop, setFertCrop] = useState('');
  const [fertArea, setFertArea] = useState('');
  const [fertNitrogen, setFertNitrogen] = useState('');
  const [fertPhosphorus, setFertPhosphorus] = useState('');
  const [fertPotassium, setFertPotassium] = useState('');

  // Pesticide guidance state
  const [pestCrop, setPestCrop] = useState('');
  const [pestPest, setPestPest] = useState('');
  const [pestDisease, setPestDisease] = useState('');
  const [pestSymptoms, setPestSymptoms] = useState('');

  // Crop monitoring state
  const [monitorCrop, setMonitorCrop] = useState('');
  const [monitorPlantingDate, setMonitorPlantingDate] = useState('');
  const [monitorSymptoms, setMonitorSymptoms] = useState('');

  const handleWeatherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherLocation.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await getCurrentWeather(weatherLocation);
      if (response.error) {
        setError(response.error);
      } else {
        setResult(formatWeatherData(response.current, i18n.language));
      }
    } catch (err) {
      setError('Weather service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await getMarketPrices(
        marketCommodity || undefined,
        marketState || undefined,
        marketDistrict || undefined
      );
      if (response.error) {
        setError(response.error);
      } else if (response.prices.length === 0) {
        setError('No market data available for the specified criteria.');
      } else {
        const formatted = response.prices.map(price => formatMarketPrice(price, i18n.language)).join('\n\n');
        setResult(`Market Price Data\n==================\n\n${formatted}\n\nSource: Agmarknet (Government of India)\nLast Updated: ${response.lastUpdated.toLocaleString(i18n.language)}`);
      }
    } catch (err) {
      setError('Market price service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSoilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        ph: soilPh ? parseFloat(soilPh) : undefined,
        nitrogen: soilNitrogen ? parseFloat(soilNitrogen) : undefined,
        phosphorus: soilPhosphorus ? parseFloat(soilPhosphorus) : undefined,
        potassium: soilPotassium ? parseFloat(soilPotassium) : undefined,
        organicCarbon: soilOrganicCarbon ? parseFloat(soilOrganicCarbon) : undefined,
        soilType: soilType || undefined,
      };
      const analysis = analyzeSoil(params);
      setResult(formatSoilAnalysis(analysis, i18n.language));
    } catch (err) {
      setError('Soil analysis service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        state: cropState,
        season: cropSeason as any,
        soilType: cropSoilType || undefined,
        waterAvailability: cropWaterAvailability as any,
        irrigationAvailable: cropIrrigation,
      };
      const response = getCropRecommendations(params);
      setResult(formatCropRecommendations(response, i18n.language));
    } catch (err) {
      setError('Crop recommendation service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        crop: seedCrop,
        state: seedState,
        season: seedSeason as any,
        irrigationAvailable: seedIrrigation,
      };
      const response = getSeedRecommendations(params);
      setResult(formatSeedRecommendations(response, i18n.language));
    } catch (err) {
      setError('Seed recommendation service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        crop: fertCrop,
        area: parseFloat(fertArea) || 1,
        soilNitrogen: fertNitrogen ? parseFloat(fertNitrogen) : undefined,
        soilPhosphorus: fertPhosphorus ? parseFloat(fertPhosphorus) : undefined,
        soilPotassium: fertPotassium ? parseFloat(fertPotassium) : undefined,
      };
      const response = getFertilizerRecommendation(params);
      setResult(formatFertilizerRecommendation(response, i18n.language));
    } catch (err) {
      setError('Fertilizer guidance service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePesticideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        crop: pestCrop,
        pest: pestPest || undefined,
        disease: pestDisease || undefined,
        symptoms: pestSymptoms || undefined,
      };
      const response = getPesticideGuidance(params);
      setResult(formatPesticideGuidance(response, i18n.language));
    } catch (err) {
      setError('Pesticide guidance service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const params = {
        crop: monitorCrop,
        plantingDate: monitorPlantingDate ? new Date(monitorPlantingDate) : new Date(),
        observedSymptoms: monitorSymptoms || undefined,
      };
      const response = getCropMonitoring(params);
      setResult(formatCropMonitoring(response, i18n.language));
    } catch (err) {
      setError('Crop monitoring service temporarily unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (slug === 'soil-analysis') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
        </div>

        <section className="soil-analysis-page card">
          <div className="soil-analysis-hero">
            <div className="soil-analysis-hero__badge">{t('dashboard.soilAnalysis.title')}</div>
            <div className="soil-analysis-hero__content">
              <h1>{t('dashboard.soilAnalysis.title')}</h1>
              <p>Understand your soil before making crop and fertilizer decisions.</p>
            </div>
          </div>

          <div className="soil-analysis-layout">
            <div className="soil-analysis-main">
              <div className="soil-analysis-block">
                <div className="soil-analysis-block__header">
                  <Leaf size={18} />
                  <h2>Soil Analysis Tool</h2>
                </div>
                <form onSubmit={handleSoilSubmit} className="grid" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil pH</label>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      placeholder="e.g., 6.5"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nitrogen (kg/ha)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={soilNitrogen}
                      onChange={(e) => setSoilNitrogen(e.target.value)}
                      placeholder="e.g., 300"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phosphorus (kg/ha)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={soilPhosphorus}
                      onChange={(e) => setSoilPhosphorus(e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Potassium (kg/ha)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={soilPotassium}
                      onChange={(e) => setSoilPotassium(e.target.value)}
                      placeholder="e.g., 200"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Organic Carbon (%)</label>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={soilOrganicCarbon}
                      onChange={(e) => setSoilOrganicCarbon(e.target.value)}
                      placeholder="e.g., 0.6"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil Type</label>
                    <select
                      className="input"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                    >
                      <option value="">Select soil type</option>
                      {getSoilTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Analyze Soil'}
                  </button>
                </form>

                {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
                {result && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {result}
                  </div>
                )}
              </div>
            </div>

            <aside className="soil-analysis-sidebar card">
              <div className="service-panel__label">What to do next</div>
              <div className="soil-action-stack">
                <Link to="/assistant" className="btn btn-primary">
                  Ask AgriYUVAN Assistant
                </Link>
              </div>
              <p className="soil-analysis-note">
                Enter values from your soil test report for accurate analysis. Contact your local Krishi Vigyan Kendra for soil testing services.
              </p>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  if (slug === 'weather') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.weather.title')}</h1>
          <p>{t('dashboard.weather.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Weather Information</div>
          <form onSubmit={handleWeatherSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location</label>
              <input
                className="input"
                type="text"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
                placeholder="Enter city or district name (e.g., Hyderabad, Warangal)"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Weather'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'market-prices') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.marketPrices.title')}</h1>
          <p>{t('dashboard.marketPrices.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Market Price Information</div>
          <form onSubmit={handleMarketSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Commodity (optional)</label>
              <select
                className="input"
                value={marketCommodity}
                onChange={(e) => setMarketCommodity(e.target.value)}
              >
                <option value="">All commodities</option>
                {getCommoditySuggestions().map(commodity => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>State (optional)</label>
              <select
                className="input"
                value={marketState}
                onChange={(e) => setMarketState(e.target.value)}
              >
                <option value="">All states</option>
                {getStateSuggestions().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>District (optional)</label>
              <input
                className="input"
                type="text"
                value={marketDistrict}
                onChange={(e) => setMarketDistrict(e.target.value)}
                placeholder="Enter district name"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Market Prices'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'crop-recommendation') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.cropRecommendation.title')}</h1>
          <p>{t('dashboard.cropRecommendation.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Crop Recommendation Tool</div>
          <form onSubmit={handleCropSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>State *</label>
              <input
                className="input"
                type="text"
                value={cropState}
                onChange={(e) => setCropState(e.target.value)}
                placeholder="e.g., Telangana"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Season</label>
              <select
                className="input"
                value={cropSeason}
                onChange={(e) => setCropSeason(e.target.value)}
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Summer">Summer</option>
                <option value="Zaid">Zaid</option>
                <option value="All Year">All Year</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil Type</label>
              <select
                className="input"
                value={cropSoilType}
                onChange={(e) => setCropSoilType(e.target.value)}
              >
                <option value="">Select soil type</option>
                {getSoilTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Water Availability</label>
              <select
                className="input"
                value={cropWaterAvailability}
                onChange={(e) => setCropWaterAvailability(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={cropIrrigation}
                  onChange={(e) => setCropIrrigation(e.target.checked)}
                />
                <span>Irrigation Available</span>
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Recommendations'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'seed-recommendation') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.seedRecommendation.title')}</h1>
          <p>{t('dashboard.seedRecommendation.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Seed Variety Recommendation</div>
          <form onSubmit={handleSeedSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop *</label>
              <select
                className="input"
                value={seedCrop}
                onChange={(e) => setSeedCrop(e.target.value)}
                required
              >
                <option value="">Select crop</option>
                {getCropList().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>State *</label>
              <input
                className="input"
                type="text"
                value={seedState}
                onChange={(e) => setSeedState(e.target.value)}
                placeholder="e.g., Telangana"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Season</label>
              <select
                className="input"
                value={seedSeason}
                onChange={(e) => setSeedSeason(e.target.value)}
              >
                {getSeasons().map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={seedIrrigation}
                  onChange={(e) => setSeedIrrigation(e.target.checked)}
                />
                <span>Irrigation Available</span>
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Seed Varieties'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'fertilizer-guidance') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.fertilizerRecommendation.title')}</h1>
          <p>{t('dashboard.fertilizerRecommendation.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Fertilizer Recommendation Calculator</div>
          <form onSubmit={handleFertilizerSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop *</label>
              <select
                className="input"
                value={fertCrop}
                onChange={(e) => setFertCrop(e.target.value)}
                required
              >
                <option value="">Select crop</option>
                {getFertilizerCropList().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Area (acres) *</label>
              <input
                className="input"
                type="number"
                min="0.1"
                step="0.1"
                value={fertArea}
                onChange={(e) => setFertArea(e.target.value)}
                placeholder="e.g., 2"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil Nitrogen (kg/ha) - Optional</label>
              <input
                className="input"
                type="number"
                min="0"
                value={fertNitrogen}
                onChange={(e) => setFertNitrogen(e.target.value)}
                placeholder="From soil test"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil Phosphorus (kg/ha) - Optional</label>
              <input
                className="input"
                type="number"
                min="0"
                value={fertPhosphorus}
                onChange={(e) => setFertPhosphorus(e.target.value)}
                placeholder="From soil test"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Soil Potassium (kg/ha) - Optional</label>
              <input
                className="input"
                type="number"
                min="0"
                value={fertPotassium}
                onChange={(e) => setFertPotassium(e.target.value)}
                placeholder="From soil test"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Calculate Fertilizer'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'pesticide-guidance') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.pesticideRecommendation.title')}</h1>
          <p>{t('dashboard.pesticideRecommendation.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">IPM Pest & Disease Guidance</div>
          <form onSubmit={handlePesticideSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop *</label>
              <select
                className="input"
                value={pestCrop}
                onChange={(e) => setPestCrop(e.target.value)}
                required
              >
                <option value="">Select crop</option>
                {getPesticideCropList().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Pest (optional)</label>
              <select
                className="input"
                value={pestPest}
                onChange={(e) => setPestPest(e.target.value)}
              >
                <option value="">Select pest</option>
                {pestCrop && getPestList(pestCrop).map(pest => (
                  <option key={pest} value={pest}>{pest}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Disease (optional)</label>
              <select
                className="input"
                value={pestDisease}
                onChange={(e) => setPestDisease(e.target.value)}
              >
                <option value="">Select disease</option>
                {pestCrop && getDiseaseList(pestCrop).map(disease => (
                  <option key={disease} value={disease}>{disease}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Symptoms (optional)</label>
              <textarea
                className="input"
                rows={3}
                value={pestSymptoms}
                onChange={(e) => setPestSymptoms(e.target.value)}
                placeholder="Describe observed symptoms"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get IPM Guidance'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (slug === 'crop-monitoring') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
          <h1>{t('dashboard.cropMonitoring.title')}</h1>
          <p>{t('dashboard.cropMonitoring.description')}</p>
        </div>

        <section className="card service-panel">
          <div className="service-panel__label">Crop Growth Stage Monitoring</div>
          <form onSubmit={handleMonitorSubmit} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Crop *</label>
              <select
                className="input"
                value={monitorCrop}
                onChange={(e) => setMonitorCrop(e.target.value)}
                required
              >
                <option value="">Select crop</option>
                {getMonitoringCropList().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Planting Date</label>
              <input
                className="input"
                type="date"
                value={monitorPlantingDate}
                onChange={(e) => setMonitorPlantingDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Observed Symptoms (optional)</label>
              <textarea
                className="input"
                rows={3}
                value={monitorSymptoms}
                onChange={(e) => setMonitorSymptoms(e.target.value)}
                placeholder="Describe any observed issues"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Monitoring Guidance'}
            </button>
          </form>

          {error && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>{error}</div>}
          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', whiteSpace: 'pre-wrap' }}>
              {result}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="service-page__header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} />
          {t('common.back')}
        </Link>
        <h1>{t(titleKey)}</h1>
        <p>{t(descriptionKey)}</p>
      </div>

      <div className="service-layout">
        <section className="card service-panel">
          <div className="service-panel__label">{t('dashboard.serviceOverview')}</div>
          <h2>{t(titleKey)}</h2>
          <p>{t(descriptionKey)}</p>

          <div className="info-list">
            {tips.map((tip) => (
              <div key={tip} className="info-item">
                <CheckCircle2 size={18} />
                <span>{t(tip)}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="card service-side-panel">
          <div className="service-panel__label">{t('dashboard.quickActions')}</div>
          <h3>{t('dashboard.helpTitle')}</h3>
          <p>{t('dashboard.helpText')}</p>
          <Link to="/assistant" className="btn btn-primary">
            {t('dashboard.helpAction')}
          </Link>
        </aside>
      </div>
    </div>
  );
}

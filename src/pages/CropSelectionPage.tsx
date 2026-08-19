import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ArrowRight, Sprout, MapPin, Droplets, Thermometer } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { getCropRecommendations, CropParameters, getSoilTypes, getStateCropSeasons } from '../services/cropService';
import { LandPlot, CropInfo } from '../services/userProfileService';

interface SelectedCrop {
  id: string;
  cropName: string;
  area: string;
  season: string;
  plotId: string;
  recommendation?: any;
}

export default function CropSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile } = useContext(AuthContext);
  
  // Pre-fill from existing farmer profile if available
  const existingFarmerProfile = userProfile?.farmerProfile;
  
  const [selectedState, setSelectedState] = useState(existingFarmerProfile?.landPlots?.[0]?.location?.split(',').pop()?.trim() || '');
  const [selectedSeason, setSelectedSeason] = useState('Kharif');
  const [soilType, setSoilType] = useState(existingFarmerProfile?.landPlots?.[0]?.soilType || '');
  const [irrigationAvailable, setIrrigationAvailable] = useState(true);
  const [waterAvailability, setWaterAvailability] = useState<'High' | 'Medium' | 'Low' | 'Rainfed'>('Medium');
  const [landPlots, setLandPlots] = useState<LandPlot[]>(
    existingFarmerProfile?.landPlots?.length ? existingFarmerProfile.landPlots : [{ id: '1', area: '', location: '', soilType: '', crop: '' }]
  );
  const [selectedCrops, setSelectedCrops] = useState<SelectedCrop[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const soilTypes = getSoilTypes();
  const seasons = ['Kharif', 'Rabi', 'Summer', 'Zaid', 'All Year'];
  const states = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Rajasthan', 'Odisha', 'Bihar', 'Kerala'];
  const waterLevels = ['High', 'Medium', 'Low', 'Rainfed'];

  const addLandPlot = () => {
    setLandPlots([...landPlots, { id: Date.now().toString(), area: '', location: '', soilType: '', crop: '' }]);
  };

  const removeLandPlot = (id: string) => {
    setLandPlots(landPlots.filter(plot => plot.id !== id));
  };

  const updateLandPlot = (id: string, field: keyof LandPlot, value: string) => {
    setLandPlots(landPlots.map(plot => plot.id === id ? { ...plot, [field]: value } : plot));
  };

  const handleGetRecommendations = async () => {
    setError('');
    setLoading(true);
    
    try {
      const params: CropParameters = {
        state: selectedState,
        season: selectedSeason as any,
        soilType,
        waterAvailability,
        irrigationAvailable,
        landSize: landPlots.reduce((sum, plot) => sum + parseFloat(plot.area || '0'), 0),
      };

      const response = getCropRecommendations(params);
      
      if (response.error) {
        setError(response.error);
        setRecommendations([]);
      } else {
        setRecommendations(response.recommendations);
        setShowRecommendations(true);
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get crop recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectCrop = (recommendation: any, plotId: string) => {
    const existingPlot = landPlots.find(p => p.id === plotId);
    const area = existingPlot?.area || landPlots[0]?.area || '1';
    
    const newCrop: SelectedCrop = {
      id: Date.now().toString(),
      cropName: recommendation.crop,
      area,
      season: selectedSeason,
      plotId,
      recommendation,
    };
    
    setSelectedCrops([...selectedCrops, newCrop]);
  };

  const removeSelectedCrop = (id: string) => {
    setSelectedCrops(selectedCrops.filter(crop => crop.id !== id));
  };

  const handleProceedToSeeds = () => {
    if (selectedCrops.length === 0) {
      setError('Please select at least one crop before proceeding.');
      return;
    }
    
    // Store selected crops in sessionStorage for seed selection page
    sessionStorage.setItem('selectedCrops', JSON.stringify(selectedCrops));
    sessionStorage.setItem('farmerLocation', selectedState);
    sessionStorage.setItem('selectedSeason', selectedSeason);
    
    navigate('/seed-selection');
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'High': return '#166534';
      case 'Medium': return '#ca8a04';
      case 'Low': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Crop Selection & Recommendations
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Select your land details and get AI-powered crop recommendations
          </p>
        </div>

        {/* Location and Season */}
        <div className="grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <MapPin size={18} />
              State/Region
            </div>
            <select
              className="input"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
           >
              <option value="">Select your state</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Sprout size={18} />
              Season
            </div>
            <select
              className="input"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              required
            >
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Soil and Water */}
        <div className="grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
          <label>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Soil Type</div>
            <select
              className="input"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              <option value="">Select soil type</option>
              {soilTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <Droplets size={18} />
              Water Availability
            </div>
            <select
              className="input"
              value={waterAvailability}
              onChange={(e) => setWaterAvailability(e.target.value as any)}
            >
              {waterLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={{ marginBottom: '1.5rem', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={irrigationAvailable}
              onChange={(e) => setIrrigationAvailable(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 600 }}>Irrigation Available</span>
          </div>
        </label>

        {/* Land Plots */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Land Plots</h3>
            <button
              type="button"
              onClick={addLandPlot}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Add Plot
            </button>
          </div>
          
          {landPlots.map((plot, index) => (
            <div key={plot.id} className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <strong>Plot {index + 1}</strong>
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
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Area (acres)</div>
                  <input
                    className="input"
                    type="number"
                    placeholder="Area in acres"
                    value={plot.area}
                    onChange={(e) => updateLandPlot(plot.id, 'area', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </label>
                <label>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Location</div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Village/District"
                    value={plot.location}
                    onChange={(e) => updateLandPlot(plot.id, 'location', e.target.value)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGetRecommendations}
          disabled={loading || !selectedState || landPlots.every(p => !p.area)}
          style={{ width: '100%', marginBottom: '1.5rem' }}
        >
          {loading ? 'Getting Recommendations...' : 'Get Crop Recommendations'}
        </button>

        {error && (
          <div style={{ color: '#991b1b', fontSize: '0.9rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Recommended Crops for {selectedSeason} Season
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {recommendations.map((rec, index) => (
                <div key={index} className="card" style={{ padding: '1.25rem', border: '2px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, marginBottom: '0.25rem' }}>
                        {rec.crop}
                      </h4>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        background: `${getSuitabilityColor(rec.suitability)}20`,
                        color: getSuitabilityColor(rec.suitability)
                      }}>
                        {rec.suitability} Suitability
                      </span>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => selectCrop(rec, landPlots[0].id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Select
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748b' }}>
                      Why Recommended:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#1e293b' }}>
                      {rec.reasons.map((reason: string, i: number) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <div><strong>Season:</strong> {rec.growingSeason}</div>
                    <div><strong>Soil:</strong> {rec.soilRequirements}</div>
                    <div><strong>Water:</strong> {rec.waterRequirement}</div>
                    <div><strong>Duration:</strong> {rec.cropDuration}</div>
                    <div><strong>Conditions:</strong> {rec.suitableConditions}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Crops */}
        {selectedCrops.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Selected Crops ({selectedCrops.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedCrops.map((crop) => (
                <div key={crop.id} className="card" style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{crop.cropName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {crop.area} acres • {crop.season}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSelectedCrop(crop.id)}
                    style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proceed Button */}
        {selectedCrops.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={handleProceedToSeeds}
            style={{ width: '100%' }}
          >
            Proceed to Seed Selection
            <ArrowRight size={16} style={{ marginLeft: '0.5rem', display: 'inline' }} />
          </button>
        )}

        {/* Back Button */}
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Back
        </button>
      </section>
    </div>
  );
}

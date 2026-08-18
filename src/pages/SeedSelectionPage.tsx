import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  IndianRupee, 
  Star, 
  ShoppingCart, 
  Filter,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  getSeedsByCrop, 
  getSeedsByState, 
  getRecommendedSeeds,
  getNearbySeedSellers,
  compareSeedsByPrice
} from '../services/seedDatabaseService';
import { logSeedSelection } from '../services/historyService';
import { markSeedSelected } from '../services/progressService';
import type { Seed } from '../services/seedDatabaseService';

interface SeedSelectionProps {
  crop?: string;
  state?: string;
  season?: string;
  soilType?: string;
}

export default function SeedSelectionPage({ 
  crop, 
  state, 
  season, 
  soilType
}: SeedSelectionProps) {
  const navigate = useNavigate();
  const { user, userProfile } = useContext(AuthContext);
  
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [filteredSeeds, setFilteredSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  
  // Get user's location for nearby sellers
  const userState = state || '';
  const userLocation = userProfile?.farmerProfile?.landPlots?.[0]?.location || '';
  
  useEffect(() => {
    loadSeeds();
  }, [crop, state, season, soilType]);
  
  useEffect(() => {
    filterSeeds();
  }, [seeds, searchQuery, priceFilter, ratingFilter]);
  
  async function loadSeeds() {
    setLoading(true);
    setError(null);
    
    try {
      let seedData: Seed[] = [];
      
      // Try to get recommendations first if we have all parameters
      if (crop && userState && season && soilType) {
        const recommendations = await getRecommendedSeeds(
          crop,
          userState,
          season,
          soilType
        );
        seedData = recommendations;
      } else if (crop) {
        // Fallback to crop-based search
        seedData = await getSeedsByCrop(crop);
      } else if (userState) {
        // Fallback to state-based search
        seedData = await getSeedsByState(userState);
      } else {
        // Load all available seeds
        seedData = []; // Would need to implement getAllSeeds
      }
      
      setSeeds(seedData);
      setFilteredSeeds(seedData);
    } catch (err) {
      console.error('Error loading seeds:', err);
      setError('Failed to load seeds. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  function filterSeeds() {
    let filtered = [...seeds];
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(seed => 
        seed.name.toLowerCase().includes(query) ||
        seed.variety.toLowerCase().includes(query) ||
        seed.description.toLowerCase().includes(query)
      );
    }
    
    // Price filter
    if (priceFilter !== 'all') {
      const avgPrice = seeds.reduce((sum, s) => sum + s.price, 0) / seeds.length;
      filtered = filtered.filter(seed => {
        if (priceFilter === 'low') return seed.price <= avgPrice * 0.8;
        if (priceFilter === 'medium') return seed.price > avgPrice * 0.8 && seed.price <= avgPrice * 1.2;
        if (priceFilter === 'high') return seed.price > avgPrice * 1.2;
        return true;
      });
    }
    
    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(seed => (seed.rating || 0) >= ratingFilter);
    }
    
    setFilteredSeeds(filtered);
  }
  
  async function handleSelectSeed(seed: Seed) {
    setSelectedSeed(seed);
    
    if (user) {
      try {
        // Log the selection
        await logSeedSelection(user.uid, seed.name, seed.id || '', {
          variety: seed.variety,
          crop: seed.crop,
          price: seed.price,
          seller: seed.sellerName,
        });
        
        // Update progress
        await markSeedSelected(user.uid);
      } catch (err) {
        console.error('Error logging seed selection:', err);
      }
    }
  }
  
  async function handleFindNearbySellers() {
    if (!userLocation) {
      alert('Please set your location in your profile to find nearby sellers');
      return;
    }
    
    try {
      // For now, use default coordinates if user location is not geocoded
      // In production, you would geocode the location string to lat/long
      const nearbySellers = await getNearbySeedSellers(
        20.5937, // Default India center latitude
        78.9629, // Default India center longitude
        100, // 100km radius
        selectedSeed?.crop || crop || ''
      );
      
      if (nearbySellers.length > 0) {
        navigate('/nearby-sellers', { state: { sellers: nearbySellers, seed: selectedSeed } });
      } else {
        alert('No nearby sellers found for this seed');
      }
    } catch (err) {
      console.error('Error finding nearby sellers:', err);
      alert('Failed to find nearby sellers. Please try again.');
    }
  }
  
  async function handleComparePrices() {
    if (!selectedSeed?.crop) {
      alert('Please select a seed first');
      return;
    }
    
    try {
      const priceComparison = await compareSeedsByPrice(
        selectedSeed.crop,
        userState || ''
      );
      
      navigate('/price-comparison', { state: { comparison: priceComparison, seed: selectedSeed } });
    } catch (err) {
      console.error('Error comparing prices:', err);
      alert('Failed to compare prices. Please try again.');
    }
  }
  
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading seeds...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#ef4444' }}>{error}</div>
        <button
          onClick={loadSeeds}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          {crop ? `Seeds for ${crop}` : 'Seed Selection'}
        </h1>
        <p style={{ color: '#64748b' }}>
          {userState && `Showing seeds available in ${userState}`}
        </p>
      </div>
      
      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }} 
            />
            <input
              type="text"
              placeholder="Search seeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: showFilters ? '#22c55e' : '#f1f5f9',
            color: showFilters ? 'white' : '#475569',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>
      
      {/* Filter Options */}
      {showFilters && (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>
              Price Range
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
              }}
            >
              <option value="all">All Prices</option>
              <option value="low">Low (Below Average)</option>
              <option value="medium">Medium (Average)</option>
              <option value="high">High (Above Average)</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>
              Minimum Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
              }}
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: '#64748b' }}>
        {filteredSeeds.length} seed{filteredSeeds.length !== 1 ? 's' : ''} found
      </div>
      
      {/* Seeds Grid */}
      {filteredSeeds.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
            No seeds found matching your criteria
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredSeeds.map((seed) => (
            <div
              key={seed.id}
              onClick={() => handleSelectSeed(seed)}
              style={{
                border: selectedSeed?.id === seed.id ? '2px solid #22c55e' : '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {selectedSeed?.id === seed.id && (
                <CheckCircle 
                  size={24} 
                  style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem',
                    color: '#22c55e',
                  }} 
                />
              )}
              
              {seed.imageUrl && (
                <img
                  src={seed.imageUrl}
                  alt={seed.name}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                  }}
                />
              )}
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                {seed.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {seed.variety}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MapPin size={16} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{seed.location}</span>
              </div>
              
              {seed.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{seed.rating}</span>
                  {seed.totalReviews && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({seed.totalReviews} reviews)
                    </span>
                  )}
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <IndianRupee size={20} style={{ color: '#22c55e' }} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#22c55e' }}>
                    {seed.price}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    /{seed.unit}
                  </span>
                </div>
                
                {!seed.availability && (
                  <span style={{ 
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}>
                    Out of Stock
                  </span>
                )}
              </div>
              
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                {seed.description}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748b',
              }}>
                <div>
                  <span style={{ fontWeight: '500' }}>Maturity:</span> {seed.maturityDuration}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Yield:</span> {seed.yieldPotential}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Seasons:</span> {seed.suitableSeasons.join(', ')}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Soils:</span> {seed.suitableSoils.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      {selectedSeed && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}>
          <button
            onClick={handleFindNearbySellers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            <MapPin size={20} />
            Find Nearby Sellers
          </button>
          
          <button
            onClick={handleComparePrices}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            <IndianRupee size={20} />
            Compare Prices
          </button>
          
          <button
            onClick={() => navigate('/shop', { state: { seed: selectedSeed } })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            <ShoppingCart size={20} />
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
}

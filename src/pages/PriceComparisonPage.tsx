import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  TrendingDown, 
  Star, 
  MapPin,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import type { Seed } from '../services/seedDatabaseService';

interface LocationState {
  comparison: Seed[];
  seed?: Seed;
}

export default function PriceComparisonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<Seed | undefined>(state?.seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  useEffect(() => {
    async function loadSeeds() {
      setLoading(true);
      setError(null);
      
      try {
        if (state?.comparison && state.comparison.length > 0) {
          setSeeds(state.comparison);
        } else {
          setError('No seeds selected for comparison');
        }
      } catch (err) {
        console.error('Error loading seeds:', err);
        setError('Failed to load seeds for comparison');
      } finally {
        setLoading(false);
      }
    }
    
    loadSeeds();
  }, [state]);
  
  function getFilteredAndSortedSeeds(): Seed[] {
    let filtered = [...seeds];
    
    // Filter by price range
    if (priceRange !== 'all') {
      const avgPrice = seeds.reduce((sum, s) => sum + s.price, 0) / seeds.length;
      filtered = filtered.filter(seed => {
        if (priceRange === 'low') return seed.price <= avgPrice * 0.8;
        if (priceRange === 'medium') return seed.price > avgPrice * 0.8 && seed.price <= avgPrice * 1.2;
        if (priceRange === 'high') return seed.price > avgPrice * 1.2;
        return true;
      });
    }
    
    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }
  
  const sortedSeeds = getFilteredAndSortedSeeds();
  
  const lowestPrice = seeds.length > 0 ? Math.min(...seeds.map(s => s.price)) : 0;
  const highestPrice = seeds.length > 0 ? Math.max(...seeds.map(s => s.price)) : 0;
  const avgPrice = seeds.length > 0 ? seeds.reduce((sum, s) => sum + s.price, 0) / seeds.length : 0;
  
  function handleBuySeed(seed: Seed) {
    navigate('/shop', { state: { seed } });
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
          Seed Price Comparison
        </h1>
        {selectedSeed && (
          <p style={{ color: '#64748b' }}>
            Comparing prices for: <strong>{selectedSeed.name}</strong> ({selectedSeed.crop})
          </p>
        )}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Loading price comparison...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
        }}>
          <div style={{ fontSize: '1.1rem', color: '#991b1b', marginBottom: '0.5rem' }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/seed-selection')}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginRight: '0.5rem'
            }}
          >
            Go to Seed Selection
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Price Statistics */}
      {!loading && !error && seeds.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingDown size={20} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>Lowest Price</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
            ₹{lowestPrice}
          </div>
        </div>
        
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BarChart3 size={20} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>Average Price</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
            ₹{avgPrice.toFixed(0)}
          </div>
        </div>
        
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <IndianRupee size={20} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '500' }}>Highest Price</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>
            ₹{highestPrice}
          </div>
        </div>
      </div>
      )}
      
      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="price">Price (Low to High)</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Prices</option>
            <option value="low">Low (Below Average)</option>
            <option value="medium">Medium (Average)</option>
            <option value="high">High (Above Average)</option>
          </select>
        </div>
        
        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.875rem' }}>
          Showing {sortedSeeds.length} of {seeds.length} seeds
        </div>
      </div>
      
      {/* Comparison Table */}
      {!loading && !error && sortedSeeds.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <BarChart3 size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            No seeds found matching your criteria
          </div>
        </div>
      ) : (
        !loading && !error && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: '600',
            color: '#475569',
            fontSize: '0.875rem',
          }}>
            <div>Seed Name</div>
            <div>Variety</div>
            <div>Price</div>
            <div>Rating</div>
            <div>Location</div>
            <div>Action</div>
          </div>
          
          {/* Table Rows */}
          {sortedSeeds.map((seed, index) => {
            const isLowestPrice = seed.price === lowestPrice;
            const priceDiff = avgPrice > 0 ? ((seed.price - avgPrice) / avgPrice * 100).toFixed(1) : '0';
            
            return (
              <div
                key={seed.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  padding: '1rem 1.5rem',
                  borderBottom: index < sortedSeeds.length - 1 ? '1px solid #f1f5f9' : 'none',
                  backgroundColor: isLowestPrice ? '#f0fdf4' : 'white',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ fontWeight: '500', color: '#1e293b' }}>
                  {seed.name}
                  {isLowestPrice && (
                    <span style={{
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      Best Price
                    </span>
                  )}
                </div>
                
                <div style={{ color: '#64748b' }}>{seed.variety}</div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <IndianRupee size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{seed.price}</span>
                    <span style={{ color: '#64748b' }}>/ {seed.packSize}</span>
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: parseFloat(priceDiff) < 0 ? '#22c55e' : parseFloat(priceDiff) > 0 ? '#dc2626' : '#64748b',
                  }}>
                    {parseFloat(priceDiff) < 0 ? `${priceDiff}% below avg` : parseFloat(priceDiff) > 0 ? `+${priceDiff}% above avg` : 'Average price'}
                  </div>
                </div>
                
                <div>
                  {seed.rating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                      <span style={{ fontWeight: '500' }}>{seed.rating}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>No rating</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b' }}>
                  <MapPin size={14} />
                  <span>{seed.location}</span>
                </div>
                
                <div>
                  <button
                    onClick={() => handleBuySeed(seed)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                    }}
                  >
                    <ShoppingCart size={16} />
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
      
      {/* Price Distribution Chart (Simple Bar) */}
      {!loading && !error && seeds.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
            Price Distribution
          </h3>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            height: '150px',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            overflowX: 'auto',
          }}>
            {sortedSeeds.slice(0, 20).map((seed) => {
              const barHeight = ((seed.price - lowestPrice) / (highestPrice - lowestPrice || 1)) * 100;
              return (
                <div
                  key={seed.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    minWidth: '40px',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: `${Math.max(barHeight, 10)}%`,
                      backgroundColor: seed.price === lowestPrice ? '#22c55e' : '#3b82f6',
                      borderRadius: '0.25rem 0.25rem 0 0',
                      transition: 'all 0.2s',
                    }}
                  />
                  <span style={{ fontSize: '0.625rem', color: '#64748b', textAlign: 'center' }}>
                    {seed.name.substring(0, 8)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

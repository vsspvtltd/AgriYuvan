import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Star, 
  ArrowLeft,
  Navigation,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { SeedSeller } from '../services/seedDatabaseService';
import type { Seed } from '../services/seedDatabaseService';

interface LocationState {
  sellers: SeedSeller[];
  seed?: Seed;
}

export default function NearbySellersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [sellers, setSellers] = useState<SeedSeller[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<Seed | undefined>(state?.seed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setUserLocation({ latitude: 20.5937, longitude: 78.9629 });
        }
      );
    } else {
      setUserLocation({ latitude: 20.5937, longitude: 78.9629 });
    }
  }, []);

  useEffect(() => {
    async function loadSellers() {
      setLoading(true);
      setError(null);
      
      try {
        // If sellers passed via state, use them
        if (state?.sellers && state.sellers.length > 0) {
          setSellers(state.sellers);
        } else {
          // Otherwise, load all sellers (would need to implement getAllSellers)
          setSellers([]);
        }
      } catch (err) {
        console.error('Error loading sellers:', err);
        setError('Failed to load sellers. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadSellers();
  }, [state]);
  
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function handleCallSeller(phone: string) {
    window.open(`tel:${phone}`, '_blank');
  }
  
  function handleNavigateToSeller(seller: SeedSeller) {
    if (seller.geoLocation && userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${seller.geoLocation.latitude},${seller.geoLocation.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('Location coordinates not available for this seller');
    }
  }
  
  function getDistanceFromUser(seller: SeedSeller): number {
    if (!userLocation || !seller.geoLocation) {
      return 999; // Return large distance if location not available
    }
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      seller.geoLocation.latitude,
      seller.geoLocation.longitude
    );
  }
  
  // Sort sellers by distance
  const sortedSellers = [...sellers].sort((a, b) => {
    const distA = getDistanceFromUser(a);
    const distB = getDistanceFromUser(b);
    return distA - distB;
  });
  
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
          Nearby Seed Sellers
        </h1>
        {selectedSeed && (
          <p style={{ color: '#64748b' }}>
            Showing sellers for: <strong>{selectedSeed.name}</strong> ({selectedSeed.crop})
          </p>
        )}
        {!selectedSeed && (
          <p style={{ color: '#64748b' }}>
            Showing {sellers.length} seller{sellers.length !== 1 ? 's' : ''} near you
          </p>
        )}
      </div>
      
      {/* Location Status */}
      {userLocation && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle size={20} style={{ color: '#22c55e' }} />
          <span style={{ color: '#166534', fontSize: '0.875rem' }}>
            Using your current location to find nearest sellers
          </span>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Loading nearby sellers...
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
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Sellers List */}
      {!loading && !error && sortedSellers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <MapPin size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            No sellers found nearby
          </div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Try expanding your search radius or check back later
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {sortedSellers.map((seller) => {
            const distance = getDistanceFromUser(seller);
            
            return (
              <div
                key={seller.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
                }}
              >
                {/* Distance Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  {distance < 999 ? `${distance.toFixed(1)} km away` : 'Distance unknown'}
                </div>
                
                {/* Seller Info */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                  {seller.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <MapPin size={16} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {seller.location}, {seller.state}
                  </span>
                </div>
                
                {seller.address && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    {seller.address}
                  </p>
                )}
                
                {/* Rating */}
                {seller.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                    <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{seller.rating}</span>
                    {seller.totalReviews && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({seller.totalReviews} reviews)
                      </span>
                    )}
                  </div>
                )}
                
                {/* Contact Info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Phone size={16} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{seller.phone}</span>
                  </div>
                  {seller.email && (
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {seller.email}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleCallSeller(seller.phone)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    <Phone size={18} />
                    Call
                  </button>
                  
                  <button
                    onClick={() => handleNavigateToSeller(seller)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    <Navigation size={18} />
                    Navigate
                  </button>
                </div>
                
                {/* Operating Hours (placeholder) */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Clock size={16} style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Open: 9:00 AM - 6:00 PM
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Map View Button */}
      {sortedSellers.length > 0 && userLocation && (
        <button
          onClick={() => {
            const markers = sortedSellers
              .filter(s => s.geoLocation)
              .map(s => `${s.geoLocation!.latitude},${s.geoLocation!.longitude}`)
              .join('|');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${markers}`;
            window.open(url, '_blank');
          }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <MapPin size={20} />
          View on Map
        </button>
      )}
    </div>
  );
}

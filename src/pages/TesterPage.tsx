import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Filter,
  ArrowLeft,
  Calendar,
  CheckCircle,
  User,
  Award
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';
import { 
  getTestersByState,
  getTestersBySpecialization,
  getNearbyTesters,
  createTesterRequest
} from '../services/testerService';
import { logTesterRequest } from '../services/historyService';
import type { Tester } from '../services/testerService';

interface TesterRequestProps {
  testType?: string;
  specialization?: string;
}

export default function TesterPage({ testType, specialization }: TesterRequestProps) {
  const navigate = useNavigate();
  const { user, userProfile } = useContext(AuthContext);
  
  const [testers, setTesters] = useState<Tester[]>([]);
  const [filteredTesters, setFilteredTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTester, setSelectedTester] = useState<Tester | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [requesting, setRequesting] = useState(false);
  
  const userState = userProfile?.farmerProfile?.landPlots?.[0]?.location || '';
  
  useEffect(() => {
    loadTesters();
  }, [testType, specialization]);
  
  useEffect(() => {
    filterTesters();
  }, [testers, searchQuery, stateFilter, specializationFilter]);
  
  async function loadTesters() {
    setLoading(true);
    setError(null);
    
    try {
      let testerData: Tester[] = [];
      
      if (specialization) {
        testerData = await getTestersBySpecialization(specialization);
      } else if (userState) {
        testerData = await getTestersByState(userState);
      } else {
        // Load all active testers
        testerData = await getTestersByState(''); // This would need to return all
      }
      
      setTesters(testerData);
      setFilteredTesters(testerData);
    } catch (err) {
      console.error('Error loading testers:', err);
      setError('Failed to load testers. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  function filterTesters() {
    let filtered = [...testers];
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tester => 
        tester.name.toLowerCase().includes(query) ||
        tester.location.toLowerCase().includes(query) ||
        tester.specialization.some((spec: string) => spec.toLowerCase().includes(query))
      );
    }
    
    // State filter
    if (stateFilter) {
      filtered = filtered.filter(tester => tester.state === stateFilter);
    }
    
    // Specialization filter
    if (specializationFilter) {
      filtered = filtered.filter(tester => 
        tester.specialization.includes(specializationFilter)
      );
    }
    
    setFilteredTesters(filtered);
  }
  
  async function handleRequestTesting() {
    if (!selectedTester || !user) return;
    
    setRequesting(true);
    
    try {
      const requestId = await createTesterRequest({
        userId: user.uid,
        testerId: selectedTester.id || '',
        testType: testType || 'Soil Testing',
        requestedDate: Timestamp.now(),
        status: 'pending',
        notes: requestNotes,
      });
      
      // Log the request
      await logTesterRequest(
        user.uid,
        selectedTester.name,
        testType || 'Soil Testing',
        requestId
      );
      
      setShowRequestModal(false);
      setRequestNotes('');
      alert('Testing request submitted successfully!');
      setSelectedTester(null);
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setRequesting(false);
    }
  }
  
  async function handleFindNearbyTesters() {
    if (!user) {
      alert('Please log in to find nearby testers');
      return;
    }
    
    try {
      // Use default coordinates for now
      const nearbyTesters = await getNearbyTesters(
        20.5937,
        78.9629,
        100,
        testType || ''
      );
      
      setTesters(nearbyTesters);
      setFilteredTesters(nearbyTesters);
    } catch (err) {
      console.error('Error finding nearby testers:', err);
      alert('Failed to find nearby testers. Please try again.');
    }
  }
  
  function handleCallTester(phone: string) {
    window.open(`tel:${phone}`, '_blank');
  }
  
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading testers...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#ef4444' }}>{error}</div>
        <button
          onClick={loadTesters}
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
          {testType ? `${testType} Testers` : 'Find a Tester'}
        </h1>
        <p style={{ color: '#64748b' }}>
          Connect with certified soil and crop testing professionals
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
              placeholder="Search testers..."
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
        
        <button
          onClick={handleFindNearbyTesters}
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
          Find Nearby
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
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
              }}
            >
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>
              Specialization
            </label>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
              }}
            >
              <option value="">All Specializations</option>
              <option value="Soil Testing">Soil Testing</option>
              <option value="Water Testing">Water Testing</option>
              <option value="Crop Disease">Crop Disease</option>
              <option value="Pest Analysis">Pest Analysis</option>
              <option value="Nutrient Analysis">Nutrient Analysis</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: '#64748b' }}>
        {filteredTesters.length} tester{filteredTesters.length !== 1 ? 's' : ''} found
      </div>
      
      {/* Testers Grid */}
      {filteredTesters.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
        }}>
          <User size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.5rem' }}>
            No testers found matching your criteria
          </div>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Try adjusting your filters or search for nearby testers
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}>
          {filteredTesters.map((tester) => (
            <div
              key={tester.id}
              onClick={() => setSelectedTester(tester)}
              style={{
                border: selectedTester?.id === tester.id ? '2px solid #22c55e' : '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {selectedTester?.id === tester.id && (
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
              
              {/* Tester Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={24} style={{ color: '#0284c7' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {tester.name}
                  </h3>
                  {tester.certifications && tester.certifications.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Award size={14} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {tester.certifications[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MapPin size={16} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {tester.location}, {tester.state}
                </span>
              </div>
              
              {/* Rating */}
              {tester.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{tester.rating}</span>
                  {tester.totalReviews && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({tester.totalReviews} reviews)
                    </span>
                  )}
                </div>
              )}
              
              {/* Specializations */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '0.5rem' }}>
                  Specializations:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {tester.specialization.slice(0, 3).map((spec: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                  {tester.specialization.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      +{tester.specialization.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              {/* Contact */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Phone size={16} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{tester.phone}</span>
              </div>
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallTester(tester.phone);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  <Phone size={16} />
                  Call
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTester(tester);
                    setShowRequestModal(true);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  <Calendar size={16} />
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Request Modal */}
      {showRequestModal && selectedTester && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Request Testing Service
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '500', color: '#475569', marginBottom: '0.25rem' }}>
                Tester:
              </div>
              <div style={{ color: '#64748b' }}>{selectedTester.name}</div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>
                Test Type
              </label>
              <select
                value={testType || 'Soil Testing'}
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f8fafc',
                }}
              >
                <option value="Soil Testing">Soil Testing</option>
                <option value="Water Testing">Water Testing</option>
                <option value="Crop Disease">Crop Disease Analysis</option>
                <option value="Pest Analysis">Pest Analysis</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569' }}>
                Additional Notes
              </label>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Describe your testing requirements..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  resize: 'vertical',
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestNotes('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleRequestTesting}
                disabled={requesting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: requesting ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: requesting ? 0.5 : 1,
                }}
              >
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

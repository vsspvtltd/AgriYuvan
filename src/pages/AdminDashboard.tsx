import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllSeeds, 
  deleteSeed,
  updateSeed 
} from '../services/seedDatabaseService';
import { 
  getAllTesters, 
  deleteTester,
  updateTester 
} from '../services/testerService';
import { 
  getAllProducts, 
  deleteProduct,
  updateProduct 
} from '../services/productService';
import { 
  getAllSubscriptionPlans,
  updateSubscriptionPlan 
} from '../services/subscriptionService';
import type { Seed } from '../services/seedDatabaseService';
import type { Tester } from '../services/testerService';
import type { Product } from '../services/productService';
import type { SubscriptionPlan } from '../services/subscriptionService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'seeds' | 'testers' | 'products' | 'subscriptions'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalSeeds: 0,
    totalTesters: 0,
    totalProducts: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [seedsData, testersData, productsData, plansData] = await Promise.all([
          getAllSeeds(),
          getAllTesters(),
          getAllProducts(),
          getAllSubscriptionPlans(),
        ]);
        
        setSeeds(seedsData);
        setTesters(testersData);
        setProducts(productsData);
        setSubscriptionPlans(plansData);
        
        setStats({
          totalSeeds: seedsData.length,
          totalTesters: testersData.length,
          totalProducts: productsData.length,
          totalUsers: 0, // Would need user count from userProfiles
          activeSubscriptions: plansData.length,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter functions
  const filteredSeeds = seeds.filter(seed => 
    seed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seed.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seed.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTesters = testers.filter(tester => 
    tester.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tester.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tester.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete handlers
  const handleDeleteSeed = async (seedId: string) => {
    if (!confirm('Are you sure you want to delete this seed?')) return;
    
    try {
      await deleteSeed(seedId);
      setSeeds(seeds.filter(s => s.id !== seedId));
      setStats(prev => ({ ...prev, totalSeeds: prev.totalSeeds - 1 }));
    } catch (error) {
      console.error('Error deleting seed:', error);
      alert('Failed to delete seed');
    }
  };

  const handleDeleteTester = async (testerId: string) => {
    if (!confirm('Are you sure you want to delete this tester?')) return;
    
    try {
      await deleteTester(testerId);
      setTesters(testers.filter(t => t.id !== testerId));
      setStats(prev => ({ ...prev, totalTesters: prev.totalTesters - 1 }));
    } catch (error) {
      console.error('Error deleting tester:', error);
      alert('Failed to delete tester');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  // Toggle active status
  const handleToggleSeedActive = async (seed: Seed) => {
    try {
      await updateSeed(seed.id!, { ...seed, isActive: !seed.isActive });
      setSeeds(seeds.map(s => s.id === seed.id ? { ...s, isActive: !s.isActive } : s));
    } catch (error) {
      console.error('Error updating seed:', error);
      alert('Failed to update seed');
    }
  };

  const handleToggleTesterActive = async (tester: Tester) => {
    try {
      await updateTester(tester.id!, { ...tester, isActive: !tester.isActive });
      setTesters(testers.map(t => t.id === tester.id ? { ...t, isActive: !t.isActive } : t));
    } catch (error) {
      console.error('Error updating tester:', error);
      alert('Failed to update tester');
    }
  };

  const handleToggleProductActive = async (product: Product) => {
    try {
      await updateProduct(product.id!, { ...product, isActive: !product.isActive });
      setProducts(products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#475569' }}>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        padding: '1.5rem 2rem', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Admin Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage AgriYuvan platform data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#f1f5f9', 
              color: '#475569', 
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: '250px', 
          background: 'white', 
          borderRight: '1px solid #e2e8f0',
          padding: '1.5rem 1rem'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeTab === 'overview' ? '#f0fdf4' : 'transparent',
                color: activeTab === 'overview' ? '#166534' : '#475569',
                border: activeTab === 'overview' ? '1px solid #bbf7d0' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <TrendingUp size={18} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('seeds')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeTab === 'seeds' ? '#f0fdf4' : 'transparent',
                color: activeTab === 'seeds' ? '#166534' : '#475569',
                border: activeTab === 'seeds' ? '1px solid #bbf7d0' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <Package size={18} />
              Seeds
            </button>
            <button
              onClick={() => setActiveTab('testers')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeTab === 'testers' ? '#f0fdf4' : 'transparent',
                color: activeTab === 'testers' ? '#166534' : '#475569',
                border: activeTab === 'testers' ? '1px solid #bbf7d0' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <Users size={18} />
              Testers
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeTab === 'products' ? '#f0fdf4' : 'transparent',
                color: activeTab === 'products' ? '#166534' : '#475569',
                border: activeTab === 'products' ? '1px solid #bbf7d0' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <ShoppingCart size={18} />
              Products
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeTab === 'subscriptions' ? '#f0fdf4' : 'transparent',
                color: activeTab === 'subscriptions' ? '#166534' : '#475569',
                border: activeTab === 'subscriptions' ? '1px solid #bbf7d0' : 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <Settings size={18} />
              Subscriptions
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              alignItems: 'center'
            }}>
              <div style={{ 
                flex: 1,
                position: 'relative',
                maxWidth: '400px'
              }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>
              <button style={{
                padding: '0.75rem 1rem',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <Filter size={16} />
                Filters
              </button>
              <button style={{
                padding: '0.75rem 1rem',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: '#1e293b' }}>Overview</h2>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#166534'
                    }}>
                      <Package size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                        {stats.totalSeeds}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Seeds</div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#166534'
                    }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                        {stats.totalTesters}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Testers</div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#166534'
                    }}>
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                        {stats.totalProducts}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Products</div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'white', 
                  padding: '1.5rem', 
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#166534'
                    }}>
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>
                        {stats.activeSubscriptions}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Subscription Plans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seeds Tab */}
          {activeTab === 'seeds' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Seeds Management</h2>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: '#166534',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <Plus size={16} />
                  Add Seed
                </button>
              </div>

              <div style={{ 
                background: 'white', 
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Crop</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>State</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Stock</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSeeds.map((seed) => (
                      <tr key={seed.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b' }}>{seed.name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{seed.crop}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{seed.state}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>₹{seed.price}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{seed.stockQuantity}</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleToggleSeedActive(seed)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: seed.isActive ? '#f0fdf4' : '#fef2f2',
                              color: seed.isActive ? '#166534' : '#991b1b',
                              border: seed.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                              borderRadius: '1rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            {seed.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button style={{ padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer' }}>
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSeed(seed.id!)}
                              style={{ padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', color: '#991b1b' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Testers Tab */}
          {activeTab === 'testers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Testers Management</h2>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: '#166534',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <Plus size={16} />
                  Add Tester
                </button>
              </div>

              <div style={{ 
                background: 'white', 
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Specialization</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Rating</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTesters.map((tester) => (
                      <tr key={tester.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b' }}>{tester.name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{tester.location}, {tester.state}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                          {tester.specialization.slice(0, 2).join(', ')}
                          {tester.specialization.length > 2 && '...'}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{tester.rating} ⭐</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleToggleTesterActive(tester)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: tester.isActive ? '#f0fdf4' : '#fef2f2',
                              color: tester.isActive ? '#166534' : '#991b1b',
                              border: tester.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                              borderRadius: '1rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            {tester.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button style={{ padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer' }}>
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTester(tester.id!)}
                              style={{ padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', color: '#991b1b' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Products Management</h2>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: '#166534',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              <div style={{ 
                background: 'white', 
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>State</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Stock</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b' }}>{product.name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{product.category}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{product.state}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>₹{product.price}</td>
                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{product.stockQuantity}</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleToggleProductActive(product)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: product.isActive ? '#f0fdf4' : '#fef2f2',
                              color: product.isActive ? '#166534' : '#991b1b',
                              border: product.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                              borderRadius: '1rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button style={{ padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.375rem', cursor: 'pointer' }}>
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id!)}
                              style={{ padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', cursor: 'pointer', color: '#991b1b' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Subscription Plans</h2>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: '#166534',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  <Plus size={16} />
                  Add Plan
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} style={{ 
                    background: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.25rem' }}>{plan.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{plan.description}</p>
                      </div>
                      <div style={{ 
                        padding: '0.25rem 0.75rem',
                        background: plan.isActive ? '#f0fdf4' : '#fef2f2',
                        color: plan.isActive ? '#166534' : '#991b1b',
                        border: plan.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        borderRadius: '1rem',
                        fontSize: '0.8rem'
                      }}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                      ₹{plan.price}
                      <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b' }}>/{plan.billingCycle}</span>
                    </div>
                    
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginBottom: '1.5rem' }}>
                      {plan.features.map((feature, index) => (
                        <li key={index} style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#166534' }}>✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ 
                        flex: 1,
                        padding: '0.5rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}>
                        <Edit size={14} />
                      </button>
                      <button style={{ 
                        flex: 1,
                        padding: '0.5rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

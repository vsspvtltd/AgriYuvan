import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Bluetooth, Scan, History, Cloud, ShoppingBag, CheckCircle, Circle, Search, MapPin } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { dashboardServices } from '../config/dashboardServices';
import { Link } from 'react-router-dom';
import { UserRole } from '../services/userProfileService';
import { getUserHistory } from '../services/historyService';
import { getUserProgress } from '../services/progressService';
import { getCurrentWeather } from '../services/weatherService';
import { bluetoothService } from '../services/bluetoothService';
import { scanService } from '../services/scanService';
import type { UserHistory } from '../services/historyService';
import type { UserProgress } from '../services/progressService';
import type { WeatherResponse } from '../services/weatherService';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, userProfile } = useContext(AuthContext);
  const displayName = userProfile?.farmerProfile?.name ||
                    userProfile?.vendorProfile?.name ||
                    userProfile?.traderProfile?.name ||
                    user?.displayName ||
                    user?.email?.split('@')[0] ||
                    'Demo Farmer';

  const userRole = userProfile?.role || 'farmer';

  // State for new features
  const [bluetoothStatus, setBluetoothStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [scanActive, setScanActive] = useState(false);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data from Firestore
  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user history
        const history = await getUserHistory(user.uid, 5);
        setUserHistory(history);
        
        // Fetch user progress
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);
        
        // Fetch weather data (using default location for now)
        const location = userProfile?.farmerProfile?.landPlots?.[0]?.location || 'Mumbai';
        const weather = await getCurrentWeather(location, 'Maharashtra');
        setWeatherData(weather);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [user, userProfile]);

  // Check Bluetooth connection status
  useEffect(() => {
    if (bluetoothService.isConnected()) {
      setBluetoothStatus('connected');
    }
  }, []);

  const progressStages = userProgress?.stages || [
    { id: 1, name: 'Registration', completed: true },
    { id: 2, name: 'Land Details Added', completed: true },
    { id: 3, name: 'Crop Details Added', completed: false },
    { id: 4, name: 'Testing', completed: false },
    { id: 5, name: 'Analysis', completed: false },
    { id: 6, name: 'Recommendation', completed: false },
    { id: 7, name: 'Purchase/Shop', completed: false },
    { id: 8, name: 'Completed', completed: false },
  ];

  const getServicesByRole = (role: UserRole) => {
    const allServices = dashboardServices;
    
    if (role === 'farmer') {
      return allServices; // Farmers see all services
    } else if (role === 'vendor') {
      // Vendors see relevant services
      return allServices.filter(service => 
        ['soil-analysis', 'crop-recommendation', 'seed-recommendation', 'fertilizer-guidance', 'pesticide-guidance'].includes(service.slug)
      );
    } else if (role === 'trader') {
      // Traders see market-related services
      return allServices.filter(service => 
        ['market-prices', 'weather'].includes(service.slug)
      );
    }
    return allServices;
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return t('role.farmer');
      case 'vendor':
        return t('role.vendor');
      case 'trader':
        return t('role.trader');
      default:
        return t('role.farmer');
    }
  };

  const visibleServices = getServicesByRole(userRole);

  const handleBluetoothConnect = async () => {
    setBluetoothStatus('connecting');
    try {
      // Use actual bluetooth service
      const device = await bluetoothService.requestDevice();
      await bluetoothService.connect(device.id);
      setBluetoothStatus('connected');
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      setBluetoothStatus('disconnected');
    }
  };

  const handleScan = () => {
    setScanActive(!scanActive);
    if (!scanActive) {
      // Start scanning using scanService
      scanService.addListener('scan', (result) => {
        console.log('Scan result:', result);
        // Handle scan result - navigate to appropriate page
      });
    } else {
      // Stop scanning
      scanService.stopScanning();
    }
  };

  const displayHistory = userHistory.length > 0 ? userHistory : [
    { id: 1, type: 'Test', description: 'Soil Analysis Test', date: '2024-01-15' },
    { id: 2, type: 'Scan', description: 'QR Code Scan - Paddy Seeds', date: '2024-01-14' },
    { id: 3, type: 'Order', description: 'Fertilizer Purchase', date: '2024-01-10' },
  ];

  const displayWeather = weatherData?.current ? {
    temperature: weatherData.current.temperature,
    condition: weatherData.current.description,
    humidity: weatherData.current.humidity,
    rainfall: weatherData.current.precipitation,
    alert: 'No severe weather alerts',
  } : {
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    rainfall: 0,
    alert: 'No severe weather alerts',
  };

  return (
    <div className="container page dashboard-page">
      <header className="dashboard-header card">
        <div className="dashboard-header__top">
          <div className="dashboard-header__title-group">
            <div className="eyebrow">{t('dashboard.eyebrow')}</div>
            <h1>{t('common.dashboard')}</h1>
          </div>
          <Logo compact />
        </div>

        <div className="dashboard-header__content">
          <div className="dashboard-header__text-block">
            <p className="dashboard-header__welcome">
              {t('dashboard.welcomeBack')}, {displayName}
            </p>
            <p className="dashboard-header__subtitle">
              {t('dashboard.roleLabel')}: {getRoleDisplayName(userRole)}
            </p>
          </div>
          <Link to="/assistant" className="btn btn-primary dashboard-header__cta">
            {t('dashboard.askAssistant')}
          </Link>
        </div>
      </header>

      <section className="dashboard-section" aria-labelledby="dashboard-services-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">{t('dashboard.eyebrow')}</div>
          <h2 id="dashboard-services-heading">{t('dashboard.services')}</h2>
          <p>{t('dashboard.subtitle')}</p>
        </div>

        <div className="dashboard-grid" aria-label={t('dashboard.services')}>
          {visibleServices.map((service) => (
            <Link key={service.slug} to={service.path} className="service-card" aria-label={t(service.titleKey)}>
              <div className="service-card__content">
                <div className="service-card__icon">{service.icon}</div>
                <div className="service-card__body">
                  <div className="service-card__heading">
                    <h3>{t(service.titleKey)}</h3>
                    <span className="service-card__arrow" aria-hidden="true">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                  <p>{t(service.descriptionKey)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-help card">
        <div className="dashboard-help__content">
          <div className="dashboard-help__copy">
            <div className="eyebrow">{t('dashboard.helpTitle')}</div>
            <h3>{t('dashboard.needHelp')}</h3>
          </div>
          <Link to="/assistant" className="btn btn-secondary dashboard-help__button">
            {t('dashboard.helpAction')}
          </Link>
        </div>
      </section>

      {/* New Home Page Sections */}
      <section className="dashboard-section" aria-labelledby="quick-actions-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">Quick Actions</div>
          <h2 id="quick-actions-heading">Quick Actions</h2>
        </div>
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {/* Look for a Tester */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <Search size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Look for a Tester</h3>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem' }}>
              Find and request agricultural testers near your location
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Find Testers
            </button>
          </div>

          {/* Bluetooth */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <Bluetooth size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Bluetooth</h3>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem' }}>
              Connect to agricultural IoT devices via Bluetooth
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: bluetoothStatus === 'connected' ? '#166534' : bluetoothStatus === 'connecting' ? '#f59e0b' : '#cbd5e1' }} />
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {bluetoothStatus === 'connected' ? 'Connected' : bluetoothStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={handleBluetoothConnect}
              disabled={bluetoothStatus === 'connecting'}
            >
              {bluetoothStatus === 'connecting' ? 'Connecting...' : 'Connect Device'}
            </button>
          </div>

          {/* Scan */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <Scan size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Scan</h3>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem' }}>
              Scan QR codes, barcodes, or identify agricultural products
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleScan}
            >
              {scanActive ? 'Stop Scanning' : 'Start Scanning'}
            </button>
          </div>

          {/* Shop */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <ShoppingBag size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>AgriYuvan Shop</h3>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem' }}>
              Browse and purchase agricultural products
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Visit Shop
            </button>
          </div>
        </div>
      </section>

      {/* Your Progress Section */}
      <section className="dashboard-section" aria-labelledby="progress-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">Your Journey</div>
          <h2 id="progress-heading">Your Progress</h2>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {progressStages.map((stage, index) => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: stage.completed ? '#f0fdf4' : '#f1f5f9', border: stage.completed ? '1px solid #bbf7d0' : '1px solid #cbd5e1', flexShrink: 0 }}>
                  {stage.completed ? <CheckCircle size={16} style={{ color: '#166534' }} /> : <Circle size={16} style={{ color: '#cbd5e1' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: stage.completed ? 600 : 400, color: stage.completed ? '#1e293b' : '#64748b' }}>
                    {stage.name}
                  </div>
                </div>
                {index < progressStages.length - 1 && (
                  <div style={{ position: 'absolute', left: 'calc(1.5rem + 16px)', top: 'calc(1.5rem + 32px)', width: '2px', height: '100%', background: stage.completed ? '#bbf7d0' : '#e2e8f0' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="dashboard-section" aria-labelledby="history-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">Activity</div>
          <h2 id="history-heading">History</h2>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayHistory.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', flexShrink: 0 }}>
                  <History size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                    {item.type}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {item.description}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weather Alerts Section */}
      <section className="dashboard-section" aria-labelledby="weather-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">Weather</div>
          <h2 id="weather-heading">Weather Alerts</h2>
        </div>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                <Cloud size={28} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                  {displayWeather.temperature}°C
                </div>
                <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
                  {displayWeather.condition}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Humidity: {displayWeather.humidity}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Rainfall: {displayWeather.rainfall}mm
              </div>
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={16} style={{ color: '#166534' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Weather Alert</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              {displayWeather.alert}
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="dashboard-section" aria-labelledby="subscription-heading">
        <div className="dashboard-section__heading">
          <div className="eyebrow">Plans</div>
          <h2 id="subscription-heading">Subscription</h2>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
              Current Plan: Free
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Upgrade to access premium features and unlimited services
            </p>
          </div>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ padding: '1.25rem', border: '2px solid #166534', borderRadius: '12px', background: '#f0fdf4' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
                Premium
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                ₹299<span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b' }}>/month</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Unlimited tests
                </li>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Priority support
                </li>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Advanced analytics
                </li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Upgrade Now
              </button>
            </div>
            <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#ffffff' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                Enterprise
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                ₹999<span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#64748b' }}>/month</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Everything in Premium
                </li>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Multi-user access
                </li>
                <li style={{ fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={14} style={{ color: '#166534' }} /> Custom integrations
                </li>
              </ul>
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

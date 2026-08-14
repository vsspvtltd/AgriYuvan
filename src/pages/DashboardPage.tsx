import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { dashboardServices } from '../config/dashboardServices';
import { Link } from 'react-router-dom';
import { UserRole } from '../services/userProfileService';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, userProfile } = useContext(AuthContext);
  const displayName = userProfile?.farmerProfile?.name || 
                    userProfile?.vendorProfile?.name || 
                    userProfile?.traderProfile?.name ||
                    user?.displayName || 
                    user?.email?.split('@')[0] || 
                    'Farmer';
  
  const userRole = userProfile?.role || 'farmer';

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
    </div>
  );
}

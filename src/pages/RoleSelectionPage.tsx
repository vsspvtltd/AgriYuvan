import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Store, TrendingUp, ArrowRight } from 'lucide-react';

export type UserRole = 'farmer' | 'vendor' | 'trader';

interface RoleOption {
  id: UserRole;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

export default function RoleSelectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles: RoleOption[] = [
    {
      id: 'farmer',
      icon: <User size={32} />,
      titleKey: 'role.farmer',
      descriptionKey: 'role.farmerDescription',
    },
    {
      id: 'vendor',
      icon: <Store size={32} />,
      titleKey: 'role.vendor',
      descriptionKey: 'role.vendorDescription',
    },
    {
      id: 'trader',
      icon: <TrendingUp size={32} />,
      titleKey: 'role.trader',
      descriptionKey: 'role.traderDescription',
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem('userRole', selectedRole);
      navigate(`/role-details/${selectedRole}`);
    }
  };

  return (
    <div className="container page">
      <section className="card auth-card">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {t('role.title')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            {t('role.subtitle')}
          </p>
        </div>

        <div className="grid" style={{ gap: '1rem', marginBottom: '2rem' }}>
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`role-card ${selectedRole === role.id ? 'role-card--selected' : ''}`}
              style={{
                padding: '1.5rem',
                border: '2px solid',
                borderColor: selectedRole === role.id ? '#166534' : '#e2e8f0',
                borderRadius: '12px',
                background: selectedRole === role.id ? '#f0fdf4' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ color: selectedRole === role.id ? '#166534' : '#475569' }}>
                {role.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {t(role.titleKey)}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {t(role.descriptionKey)}
                </div>
              </div>
              {selectedRole === role.id && (
                <ArrowRight size={20} color="#166534" />
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate('/phone-login')}
            style={{ flex: 1 }}
          >
            {t('common.back')}
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            style={{ flex: 1 }}
          >
            {t('common.continue')}
          </button>
        </div>
      </section>
    </div>
  );
}

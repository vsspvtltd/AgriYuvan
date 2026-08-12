import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  to: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
}

export default function ServiceCard({ to, titleKey, descriptionKey, icon }: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <Link to={to} className="service-card" aria-label={t(titleKey)}>
      <div className="service-card__icon">{icon}</div>
      <div className="service-card__heading">
        <h3>{t(titleKey)}</h3>
        <span className="service-card__arrow" aria-hidden="true">
          <ArrowRight size={16} />
        </span>
      </div>
      <p>{t(descriptionKey)}</p>
    </Link>
  );
}

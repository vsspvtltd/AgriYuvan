import {
  ArrowLeft,
  CheckCircle2,
  CloudRain,
  Droplets,
  Leaf,
  ShieldCheck,
  Sprout,
  TestTube2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const serviceTips: Record<string, string[]> = {
  'soil-analysis': ['dashboard.soilAnalysis.tip1', 'dashboard.soilAnalysis.tip2'],
  'crop-recommendation': ['dashboard.cropRecommendation.tip1', 'dashboard.cropRecommendation.tip2'],
  'seed-recommendation': ['dashboard.seedRecommendation.tip1', 'dashboard.seedRecommendation.tip2'],
  'fertilizer-guidance': ['dashboard.fertilizerRecommendation.tip1', 'dashboard.fertilizerRecommendation.tip2'],
  'pesticide-guidance': ['dashboard.pesticideRecommendation.tip1', 'dashboard.pesticideRecommendation.tip2'],
  'weather': ['dashboard.weather.tip1', 'dashboard.weather.tip2'],
  'market-prices': ['dashboard.marketPrices.tip1', 'dashboard.marketPrices.tip2'],
  'crop-monitoring': ['dashboard.cropMonitoring.tip1', 'dashboard.cropMonitoring.tip2'],
};

const soilCheckList = [
  { icon: <TestTube2 size={18} />, title: 'Soil Nutrients', description: 'Understand nitrogen, phosphorus and potassium levels in the field.' },
  { icon: <Droplets size={18} />, title: 'Soil pH', description: 'Check whether the soil is acidic, neutral or alkaline.' },
  { icon: <CloudRain size={18} />, title: 'Soil Moisture', description: 'Assess whether the soil has adequate moisture before sowing.' },
];

const soilBenefitList = [
  'Choose crops suitable for the soil',
  'Understand nutrient requirements',
  'Plan fertilizer use',
  'Prepare soil before sowing',
  'Avoid unnecessary inputs',
];

export default function ServicePage({
  titleKey,
  descriptionKey,
  slug,
}: {
  titleKey: string;
  descriptionKey: string;
  slug: string;
}) {
  const { t } = useTranslation();
  const tips = serviceTips[slug] ?? ['dashboard.generalTip1', 'dashboard.generalTip2'];

  if (slug === 'soil-analysis') {
    return (
      <div className="container page">
        <div className="service-page__header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Link>
        </div>

        <section className="soil-analysis-page card">
          <div className="soil-analysis-hero">
            <div className="soil-analysis-hero__badge">{t('dashboard.soilAnalysis.title')}</div>
            <div className="soil-analysis-hero__content">
              <h1>{t('dashboard.soilAnalysis.title')}</h1>
              <p>Understand your soil before making crop and fertilizer decisions.</p>
            </div>
          </div>

          <div className="soil-analysis-layout">
            <div className="soil-analysis-main">
              <div className="soil-analysis-block">
                <div className="soil-analysis-block__header">
                  <Leaf size={18} />
                  <h2>What is Soil Analysis?</h2>
                </div>
                <p>
                  Soil analysis helps you understand important soil conditions such as nutrients, pH, and moisture so that you can make better crop and fertilizer decisions.
                </p>
              </div>

              <div className="soil-analysis-block">
                <div className="soil-analysis-block__header">
                  <Sprout size={18} />
                  <h2>What can you check?</h2>
                </div>
                <div className="soil-check-grid">
                  {soilCheckList.map((item) => (
                    <div key={item.title} className="soil-check-card">
                      <div className="soil-check-card__icon">{item.icon}</div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="soil-analysis-block">
                <div className="soil-analysis-block__header">
                  <ShieldCheck size={18} />
                  <h2>How it helps farmers</h2>
                </div>
                <ul className="soil-benefits-list">
                  {soilBenefitList.map((benefit) => (
                    <li key={benefit}>
                      <CheckCircle2 size={18} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="soil-analysis-sidebar card">
              <div className="service-panel__label">What to do next</div>
              <div className="soil-action-stack">
                <Link to="/dashboard" className="btn btn-secondary">
                  Enter Soil Information
                </Link>
                <Link to="/assistant" className="btn btn-primary">
                  Ask AgriYUVAN Assistant
                </Link>
              </div>
              <p className="soil-analysis-note">
                If your field information is entered manually, use the values from your soil test or local agronomy guidance to make better decisions.
              </p>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="service-page__header">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} />
          {t('common.back')}
        </Link>
        <h1>{t(titleKey)}</h1>
        <p>{t(descriptionKey)}</p>
      </div>

      <div className="service-layout">
        <section className="card service-panel">
          <div className="service-panel__label">{t('dashboard.serviceOverview')}</div>
          <h2>{t(titleKey)}</h2>
          <p>{t(descriptionKey)}</p>

          <div className="info-list">
            {tips.map((tip) => (
              <div key={tip} className="info-item">
                <CheckCircle2 size={18} />
                <span>{t(tip)}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="card service-side-panel">
          <div className="service-panel__label">{t('dashboard.quickActions')}</div>
          <h3>{t('dashboard.helpTitle')}</h3>
          <p>{t('dashboard.helpText')}</p>
          <Link to="/assistant" className="btn btn-primary">
            {t('dashboard.helpAction')}
          </Link>
        </aside>
      </div>
    </div>
  );
}

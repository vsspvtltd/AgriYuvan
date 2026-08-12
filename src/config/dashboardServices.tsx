import type { ReactNode } from 'react';
import { Activity, CloudSun, Droplets, Leaf, ShieldCheck, Sprout, TrendingUp } from 'lucide-react';

export interface DashboardService {
  slug: string;
  path: string;
  titleKey: string;
  descriptionKey: string;
  icon: ReactNode;
}

export const dashboardServices: DashboardService[] = [
  {
    slug: 'soil-analysis',
    path: '/dashboard/soil-analysis',
    titleKey: 'dashboard.soilAnalysis.title',
    descriptionKey: 'dashboard.soilAnalysis.description',
    icon: <Droplets size={22} />,
  },
  {
    slug: 'crop-recommendation',
    path: '/dashboard/crop-recommendation',
    titleKey: 'dashboard.cropRecommendation.title',
    descriptionKey: 'dashboard.cropRecommendation.description',
    icon: <Leaf size={22} />,
  },
  {
    slug: 'seed-recommendation',
    path: '/dashboard/seed-recommendation',
    titleKey: 'dashboard.seedRecommendation.title',
    descriptionKey: 'dashboard.seedRecommendation.description',
    icon: <Sprout size={22} />,
  },
  {
    slug: 'fertilizer-guidance',
    path: '/dashboard/fertilizer-guidance',
    titleKey: 'dashboard.fertilizerRecommendation.title',
    descriptionKey: 'dashboard.fertilizerRecommendation.description',
    icon: <ShieldCheck size={22} />,
  },
  {
    slug: 'pesticide-guidance',
    path: '/dashboard/pesticide-guidance',
    titleKey: 'dashboard.pesticideRecommendation.title',
    descriptionKey: 'dashboard.pesticideRecommendation.description',
    icon: <Activity size={22} />,
  },
  {
    slug: 'weather',
    path: '/dashboard/weather',
    titleKey: 'dashboard.weather.title',
    descriptionKey: 'dashboard.weather.description',
    icon: <CloudSun size={22} />,
  },
  {
    slug: 'market-prices',
    path: '/dashboard/market-prices',
    titleKey: 'dashboard.marketPrices.title',
    descriptionKey: 'dashboard.marketPrices.description',
    icon: <TrendingUp size={22} />,
  },
  {
    slug: 'crop-monitoring',
    path: '/dashboard/crop-monitoring',
    titleKey: 'dashboard.cropMonitoring.title',
    descriptionKey: 'dashboard.cropMonitoring.description',
    icon: <Leaf size={22} />,
  },
];

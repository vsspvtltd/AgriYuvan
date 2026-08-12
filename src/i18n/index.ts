import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import { getInitialLanguageCode } from '../config/languages';

const storedLanguage = getInitialLanguageCode();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
    hi: { translation: hi },
    ta: { translation: ta },
    kn: { translation: kn },
    ml: { translation: ml },
    bn: { translation: bn },
    mr: { translation: mr },
    gu: { translation: gu },
    pa: { translation: pa },
    or: { translation: or },
  },
  lng: storedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

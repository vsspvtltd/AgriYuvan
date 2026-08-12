export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  locale: string;
}

export const supportedLanguages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', locale: 'en' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', locale: 'te' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', locale: 'hi' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', locale: 'ta' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', locale: 'kn' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', locale: 'ml' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', locale: 'bn' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', locale: 'mr' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', locale: 'gu' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', locale: 'pa' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ', locale: 'or' },
];

export const LANGUAGE_STORAGE_KEY = 'agriyuvan_language';

export const getInitialLanguageCode = () => {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (!stored) return 'en';
  return supportedLanguages.some((language) => language.code === stored) ? stored : 'en';
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ny from './locales/ny.json';
import sw from './locales/sw.json';
import so from './locales/so.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ny', label: 'Chichewa', short: 'NY' },
  { code: 'sw', label: 'Kiswahili', short: 'SW' },
  { code: 'so', label: 'Somali', short: 'SO' },
];

// Maps a selected country to its most relevant default language
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  Malawi: 'ny',
  Kenya: 'sw',
  Somaliland: 'so',
};

const savedLang = localStorage.getItem('app_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ny: { translation: ny },
      sw: { translation: sw },
      so: { translation: so },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;

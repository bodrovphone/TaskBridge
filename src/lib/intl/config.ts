import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enMessages from './en';
import bgMessages from './bg';
import ruMessages from './ru';
import uaMessages from './ua';

// Translation resources (now using modular barrel exports)
const resources = {
  en: {
    translation: enMessages,
  },
  bg: {
    translation: bgMessages,
  },
  ru: {
    translation: ruMessages,
  },
  ua: {
    translation: uaMessages,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'bg', // Set default language
    fallbackLng: 'bg',
    debug: false,

    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

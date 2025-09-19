import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bgMessages from './bg';
import ruMessages from './ru';
import enMessages from './en';

// Translation resources
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

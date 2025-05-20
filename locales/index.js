/**
 * Localization configuration and language exports
 * Using i18next standard format
 */
import en from './en/translations';
import ru from './ru/translations';

// Default language settings
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'ru'];
const DEFAULT_NAMESPACE = 'translation';

// Export all language resources for i18next
export const resources = {
  en: {
    translation: en
  },
  ru: {
    translation: ru
  }
};

// Browser language detection
export const detectUserLanguage = () => {
  // Get browser language (e.g. 'en-US', 'ru-RU')
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Extract language code without region (e.g. 'en', 'ru')
  const langCode = browserLang.split('-')[0];
  
  // Check if the language is supported, otherwise return default
  return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE;
};

// i18next configuration
export const i18nextConfig = {
  resources,
  lng: detectUserLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  debug: process.env.NODE_ENV === 'development',
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: {
    escapeValue: false // React already escapes values
  },
  react: {
    useSuspense: true
  }
};

export default {
  resources,
  detectUserLanguage,
  i18nextConfig,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE
}; 
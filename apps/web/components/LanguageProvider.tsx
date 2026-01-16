'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  translations,
  type Language,
  type Translation
} from '../lib/i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Translation;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  initialLanguage?: Language;
  children: ReactNode;
}

const LanguageProvider = ({ initialLanguage = DEFAULT_LANGUAGE, children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const updateLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof document !== 'undefined') {
      document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
      copy: translations[language]
    }),
    [language, updateLanguage]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageProvider;

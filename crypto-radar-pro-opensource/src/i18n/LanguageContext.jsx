import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext({
  lang: 'vi',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('app_lang');
      return saved === 'en' ? 'en' : 'vi';
    } catch (e) {
      return 'vi';
    }
  });

  const setLang = (newLang) => {
    const validLang = newLang === 'en' ? 'en' : 'vi';
    setLangState(validLang);
    try {
      localStorage.setItem('app_lang', validLang);
    } catch (e) {
      console.warn('Could not persist language to localStorage:', e);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  const t = (key, fallback = '') => {
    if (!translations[lang]) return fallback || key;
    return translations[lang][key] || translations['vi'][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

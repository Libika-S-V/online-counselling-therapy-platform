import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const { user } = useAuth();

  useEffect(() => {
    // If user has a preferred language and it's different from the current, switch it
    if (user && user.preferredLanguage && user.preferredLanguage !== currentLang) {
      changeLanguage(user.preferredLanguage);
    }
  }, [user]);

  const changeLanguage = async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      setCurrentLang(lang);
      
      // Optionally sync preference back to server
      if (user) {
        // We'll update the user preference in a profile endpoint later
        // api.put('/auth/profile/language', { preferredLanguage: lang });
      }
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

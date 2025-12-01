import React from 'react';
import { useTranslation } from 'react-i18next';
import { appLanguages } from '../constants/languages';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Find the language code that matches the current language, even if it's a regional variant (e.g., 'en-US' -> 'en')
  const currentLanguage = appLanguages.find(lang => i18n.language.startsWith(lang.code))?.code || 'en';

  return (
    <div className="relative">
      <select 
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-surface border border-gray-300 text-textSecondary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
      >
        {appLanguages.map((lng) => (
          <option key={lng.code} value={lng.code}>
            {lng.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;

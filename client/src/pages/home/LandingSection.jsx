import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';

const LandingSection = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl md:text-6xl font-extrabold text-textPrimary leading-tight">
        {t('landing.title1')}
        <br />
        <span className="text-primary">{t('landing.title2')}</span>
      </h1>
      <p className="mt-6 text-lg text-textSecondary max-w-2xl mx-auto">
        {t('landing.subtitle')}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/register">
          <Button>{t('landing.getStarted')}</Button>
        </Link>
        <Link to="/exchange/find">
            <Button variant="outline">{t('landing.findAMatch')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingSection;

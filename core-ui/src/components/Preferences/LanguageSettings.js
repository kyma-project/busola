import { useTranslation } from 'react-i18next';
import React from 'react';
import { Select } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const languages = [{ key: 'en', text: 'English' }];
  const selectLanguage = (_, language) => {
    i18n.changeLanguage(language.key);
    LuigiClient.sendCustomMessage({
      id: 'busola.language',
      language: language.key,
    });
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">{t('settings.language')}</span>
      <Select
        options={languages}
        selectedKey={i18n.language}
        onSelect={selectLanguage}
      />
    </div>
  );
}

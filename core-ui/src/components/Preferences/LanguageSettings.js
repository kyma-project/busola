// import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { LayoutPanel, Select } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const languages = [
    { key: 'en', text: 'English' },
    { key: 'pl', text: 'Polski' },
  ];
  const selectLanguage = (_, language) => {
    console.log('send language change', language);
    i18n.changeLanguage(language.key);
    LuigiClient.sendCustomMessage({
      id: 'busola.language',
      language: language.key,
    });
  };

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('settings.language')} />
        <LayoutPanel.Actions>
          <Select
            options={languages}
            selectedKey={i18n.language}
            onSelect={selectLanguage}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
    </LayoutPanel>
  );
}

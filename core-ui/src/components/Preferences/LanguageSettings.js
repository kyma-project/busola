import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { Select } from 'fundamental-react';
import { languageAtom } from 'state/preferences/languageAtom';

const AVAILABLE_LANGUAGES = [
  { key: 'en', text: 'English' },
  { key: 'pl', text: 'Polski' },
];

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const setLanguage = useSetRecoilState(languageAtom);

  const selectLanguage = (_, language) => {
    setLanguage(language.key);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">{t('settings.language')}</span>
      <Select
        options={AVAILABLE_LANGUAGES}
        selectedKey={i18n.language}
        onSelect={selectLanguage}
      />
    </div>
  );
}

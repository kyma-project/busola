import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { Select, Option } from '@ui5/webcomponents-react';
import { languageAtom } from 'state/preferences/languageAtom';

const AVAILABLE_LANGUAGES = [{ key: 'en', text: 'English' }];

export default function LanguageSettings() {
  const { t } = useTranslation();
  const setLanguage = useSetRecoilState(languageAtom);

  const onChange = (event: any) => {
    const selectedLanguage = event.detail.selectedOption.value;
    setLanguage(selectedLanguage);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">{t('settings.language')}</span>
      <Select onChange={onChange}>
        {AVAILABLE_LANGUAGES.map(language => (
          <Option value={language.key}>{language.text}</Option>
        ))}
      </Select>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { Select, Option } from '@ui5/webcomponents-react';
import { FormField } from 'shared/ResourceForm/components/FormField';
import { languageAtom } from 'state/settings/languageAtom';

const AVAILABLE_LANGUAGES = [{ key: 'en', text: 'English' }];

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const setLanguage = useSetAtom(languageAtom);

  const onChange = (event: CustomEvent) => {
    const selectedLanguage = event.detail.selectedOption.value;
    setLanguage(selectedLanguage);
  };

  return (
    <FormField
      label={t('settings.language.title')}
      input={(props) => (
        <Select {...props} onChange={onChange}>
          {AVAILABLE_LANGUAGES.map((available_language) => (
            <Option
              value={available_language.key}
              key={available_language.key}
              selected={i18n.language === available_language.key}
            >
              {available_language.text}
            </Option>
          ))}
        </Select>
      )}
    />
  );
}

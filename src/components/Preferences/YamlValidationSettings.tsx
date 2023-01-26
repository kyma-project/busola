import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Switch } from 'fundamental-react';
import { validateYamlState } from 'state/preferences/validateYamlAtom';

export default function YamlValidationSettings() {
  const { t } = useTranslation();
  const [validateYaml, setValidateYaml] = useRecoilState(validateYamlState);

  const toggleVisibility = () => {
    setValidateYaml(!validateYaml);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.yamlValidation')}
      </span>
      <div>
        <Switch
          // TypeScript definitions are out of sync here
          // @ts-ignore
          localizedText={{
            switchLabel: t('settings.clusters.yamlValidation'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={validateYaml}
          onChange={toggleVisibility}
          compact
        />
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Switch } from 'fundamental-react';
import { validateResourcesState } from 'state/preferences/validateResourcesAtom';

export default function ResourcesValidationSettings() {
  const { t } = useTranslation();
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );

  const toggleVisibility = () => {
    setValidateResources(!validateResources);
  };

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.resourcesValidation')}
      </span>
      <div>
        <Switch
          // TypeScript definitions are out of sync here
          // @ts-ignore
          localizedText={{
            switchLabel: t('settings.clusters.resourcesValidation'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={validateResources}
          onChange={toggleVisibility}
          compact
        />
      </div>
    </div>
  );
}

import { t } from 'i18next';
import { Label, Switch } from '@ui5/webcomponents-react';
import {
  getExtendedValidateResourceState,
  validateResourcesAtom,
} from '../../../state/settings/validateResourcesAtom';
import { useAtom } from 'jotai';
import './ValidationSwitch.scss';

export const ValidationSwitch = () => {
  const [validateResources, setValidateResources] = useAtom(
    validateResourcesAtom,
  );

  const { isEnabled, policies: selectedPolicies = [] } =
    getExtendedValidateResourceState(validateResources);

  return (
    <div className="validate-resources">
      <Label for="validate-resources-switch">
        {t('upload-yaml.labels.validate-resources')}
      </Label>
      <Switch
        id="validate-resources-switch"
        accessibleName={t('upload-yaml.labels.validate-resources')}
        onChange={() =>
          setValidateResources({
            isEnabled: !isEnabled,
            policies: selectedPolicies,
          })
        }
        checked={isEnabled}
      />
    </div>
  );
};

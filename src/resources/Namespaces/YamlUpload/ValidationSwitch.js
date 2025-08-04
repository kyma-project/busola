import React from 'react';
import { t } from 'i18next';
import { Label, Switch } from '@ui5/webcomponents-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from '../../../state/preferences/validateResourcesAtom';
import { useRecoilState } from 'recoil';
import './ValidationSwitch.scss';
export const ValidationSwitch = () => {
  const [validateResources, setValidateResources] = useRecoilState(
    validateResourcesState,
  );

  const {
    isEnabled,
    choosePolicies,
    policies: selectedPolicies = [],
  } = getExtendedValidateResourceState(validateResources);

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
            choosePolicies,
            policies: selectedPolicies,
          })
        }
        checked={isEnabled}
      />
    </div>
  );
};

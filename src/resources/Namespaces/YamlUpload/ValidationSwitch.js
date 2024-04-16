import React from 'react';
import { t } from 'i18next';
import { Label, Switch } from '@ui5/webcomponents-react';
import {
  getExtendedValidateResourceState,
  validateResourcesState,
} from '../../../state/preferences/validateResourcesAtom';
import { useRecoilState } from 'recoil';

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
      <Label>{t('upload-yaml.labels.validate-resources')}</Label>
      <Switch
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

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

  const { isEnabled } = getExtendedValidateResourceState(validateResources);

  return (
    <div className="validate-resources">
      <Label for="validate-resources-switch">
        {t('upload-yaml.labels.validate-resources')}
      </Label>
      <Switch
        id="validate-resources-switch"
        accessibleName={t('upload-yaml.labels.validate-resources')}
        onChange={() =>
          setValidateResources((prev) => {
            const ext =
              typeof prev === 'object' ? prev : { isEnabled: prev as boolean };
            return { ...ext, isEnabled: !ext.isEnabled };
          })
        }
        checked={isEnabled}
      />
    </div>
  );
};

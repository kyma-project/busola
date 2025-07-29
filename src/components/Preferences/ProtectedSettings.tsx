import { Label, Switch } from '@ui5/webcomponents-react';
import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { disableResourceProtectionState } from 'state/preferences/disableResourceProtectionAtom';
import { configFeaturesNames } from 'state/types';

export default function ProtectedSettings() {
  const { t } = useTranslation();
  const [
    disableResourceProtection,
    setDisableResourceProtection,
  ] = useRecoilState(disableResourceProtectionState);

  const protectedResourcesEnabled = useFeature(
    configFeaturesNames.PROTECTED_RESOURCES,
  )?.isEnabled;

  if (!protectedResourcesEnabled) return null;

  return (
    <div className="preferences-row">
      <Label
        for="disable-resource-protection-switch"
        className="bsl-has-color-status-4"
      >
        {t('settings.clusters.disableResourceProtection')}
      </Label>
      <div>
        <Switch
          id="disable-resource-protection-switch"
          accessibleName={t('settings.clusters.disableResourceProtection')}
          checked={disableResourceProtection}
          onChange={() => setDisableResourceProtection(prevState => !prevState)}
        />
      </div>
    </div>
  );
}

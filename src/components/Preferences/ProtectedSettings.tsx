import { Switch } from 'fundamental-react';
import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { disableResourceProtectionState } from 'state/preferences/disableResourceProtectionAtom';

export default function ProtectedSettings() {
  const { t } = useTranslation();
  const [
    disableResourceProtection,
    setDisableResourceProtection,
  ] = useRecoilState(disableResourceProtectionState);

  const protectedResourcesEnabled = useFeature('PROTECTED_RESOURCES')
    ?.isEnabled;

  if (!protectedResourcesEnabled) return null;

  return (
    <div className="preferences-row">
      <span className="fd-has-color-status-4">
        {t('settings.clusters.disableResourceProtection')}
      </span>
      <div>
        <Switch
          compact
          inputProps={{
            'aria-label': t('settings.clusters.disableResourceProtection'),
          }}
          className="fd-has-display-inline-block fd-margin-begin--tiny"
          checked={disableResourceProtection}
          onChange={() => setDisableResourceProtection(prevState => !prevState)}
        />
      </div>
    </div>
  );
}

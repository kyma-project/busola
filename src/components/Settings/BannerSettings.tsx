import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Label, Button } from '@ui5/webcomponents-react';
import { dismissedBannersAtom } from 'state/settings/dismissedBannersAtom';

export default function BannerSettings() {
  const { t } = useTranslation();
  const [dismissedBanners, setDismissedBanners] = useAtom(dismissedBannersAtom);

  return (
    <div className="settings-row">
      <Label className="bsl-has-color-status-4">
        {t('settings.general.dismissed-banners')}
      </Label>
      <div>
        <Button
          design="Default"
          disabled={dismissedBanners.length === 0}
          onClick={() => setDismissedBanners([])}
        >
          {t('settings.general.restore-banners')}
        </Button>
      </div>
    </div>
  );
}

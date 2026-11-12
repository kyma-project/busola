import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Button } from '@ui5/webcomponents-react';
import { FormField } from 'shared/ResourceForm/components/FormField';
import { dismissedBannersAtom } from 'state/settings/dismissedBannersAtom';

export default function BannerSettings() {
  const { t } = useTranslation();
  const [dismissedBanners, setDismissedBanners] = useAtom(dismissedBannersAtom);

  return (
    <FormField
      label={t('settings.general.dismissed-banners')}
      input={({ className: _className, ...props }) => (
        <Button
          {...props}
          design="Default"
          disabled={dismissedBanners.length === 0}
          onClick={() => setDismissedBanners([])}
        >
          {t('settings.general.restore-banners')}
        </Button>
      )}
    />
  );
}

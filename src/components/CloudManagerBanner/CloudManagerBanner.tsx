import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';

const CLOUD_MANAGER_URL =
  'https://sapit-home-prod-004.launchpad.cfapps.eu10.hana.ondemand.com/site#my-events?sap-ui-app-id-hint=5cc2dc3b-651c-488f-be2d-3e9b3ca02ebb&/ig=16643034';

export function CloudManagerBanner() {
  const { t } = useTranslation();
  const isSapUser = useCheckSAPUser();

  if (!isSapUser) return null;

  const buttons = (
    <Button
      accessibleRole="Link"
      accessibleName={t('cloud-manager.banner.open')}
      endIcon="inspect"
      design="Emphasized"
      onClick={() =>
        window.open(CLOUD_MANAGER_URL, '_blank', 'noopener,noreferrer')
      }
    >
      {t('cloud-manager.banner.open')}
    </Button>
  );

  return (
    <FeatureCardBanner
      id="CloudManagerBanner"
      title={t('cloud-manager.banner.title')}
      description={t('cloud-manager.banner.description')}
      design="information-3"
      image="Satellite"
      buttons={buttons}
    />
  );
}

import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';

export function KymaCLIBanner() {
  const { t } = useTranslation();
  const documentationUrl =
    'https://kyma-project.io/external-content/cli/docs/user/README.html#kyma-cli';

  return (
    <FeatureCardBanner
      id="kyma-cli-banner"
      className="kyma-cli-banner-card"
      title={t('kyma-cli.banner.title')}
      description={t('kyma-cli.banner.description')}
      design={'information-4'}
      image={'KymaCLI'}
      buttons={
        <Button
          design="Emphasized"
          accessibleRole="Link"
          accessibleName={t('kyma-cli.banner.buttons.documentation')}
          accessibleDescription="Open in new tab link"
          endIcon="inspect"
          onClick={() => {
            const newWindow = window.open(
              documentationUrl,
              '_blank',
              'noopener, noreferrer',
            );
            if (newWindow) newWindow.opener = null;
          }}
        >
          {t('kyma-cli.banner.buttons.documentation')}
        </Button>
      }
    />
  );
}

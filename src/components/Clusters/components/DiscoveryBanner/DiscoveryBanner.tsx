import { useTranslation } from 'react-i18next';
import { FeatureCardBanner } from 'shared/components/FeatureCard/FeatureCard';
import { Button } from '@ui5/webcomponents-react';

type DiscoveryBannerProps = {
  discoveryBannerLink: string;
};

export default function DiscoveryBanner({
  discoveryBannerLink,
}: DiscoveryBannerProps) {
  const { t } = useTranslation();

  const buttonText = t('feedback.discovery.register');

  return (
    <FeatureCardBanner
      id="discovery-banner"
      title={t('feedback.discovery.join-discovery')}
      description={t('feedback.discovery.text')}
      image="Discovery"
      design="information-3"
      buttons={
        <Button
          design="Emphasized"
          accessibleRole="Link"
          accessibleName={buttonText}
          accessibleDescription="Open in new tab link"
          onClick={() => {
            window.open(discoveryBannerLink, '_blank', 'noopener,noreferrer');
          }}
        >
          {buttonText}
        </Button>
      }
    />
  );
}

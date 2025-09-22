import { FlexBox, Title, Text, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import './DiscoveryBanner.scss';
import bannerImg from './assets/Team.png';
import closeIcon from './assets/xIcon.svg';

type DiscoveryBannerProps = {
  setHideDiscoveryBanner?: (hide: boolean) => void;
  discoveryBannerLink: string;
};

export default function DiscoveryBanner({
  setHideDiscoveryBanner,
  discoveryBannerLink,
}: DiscoveryBannerProps) {
  const { t } = useTranslation();

  return (
    <FlexBox className="discovery-banner">
      <div
        onClick={() => setHideDiscoveryBanner && setHideDiscoveryBanner(true)}
        className="close-icon"
      >
        <img src={closeIcon} alt="Close" />
      </div>
      <FlexBox className="banner-content" direction="Column" gap={16}>
        <Title level="H6" size="H6" className="sapMTitle">
          {t('feedback.discovery.join-discovery')}
        </Title>
        <Text className="sapMText">{t('feedback.discovery.text')}</Text>
        <Button
          accessibleRole="Link"
          accessibleName={t('feedback.discovery.register')}
          accessibleDescription="Open in new tab link"
          design="Emphasized"
          className="discovery-button"
          onClick={() => {
            const newWindow = window.open(
              discoveryBannerLink,
              '_blank',
              'noopener, noreferrer',
            );
            if (newWindow) newWindow.opener = null;
          }}
        >
          {t('feedback.discovery.register')}
        </Button>
      </FlexBox>
      <img src={bannerImg} alt="Discovery Team" className="discovery-image" />
    </FlexBox>
  );
}

import { Button, Card, Text, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import busolaModuleCardIllustration from './assets/busolaModuleCardIllustration.svg';
import busolaModuleCardShape from './assets/busolaModuleCardShape.svg';
import './FeaturedCard.scss';

export function FeaturedCard({ structure }) {
  const { t } = useTranslation();

  const [hideBanner, setHideBanner] = useState(false);
  const hideBannerKey = `hideBanner${structure?.id}`;

  useEffect(() => {
    if (!structure?.id) return;
    const storedHideValue = localStorage.getItem(hideBannerKey);
    if (storedHideValue !== null) setHideBanner(storedHideValue === 'true');
  }, [hideBannerKey, structure]);

  const handleToggle = () => {
    const updatedBoolean = true;
    setHideBanner(updatedBoolean);
    localStorage.setItem(hideBannerKey, updatedBoolean);
  };

  if (!structure?.id) return <></>;
  return !hideBanner ? (
    <div style={spacing.sapUiSmallMargin}>
      <Card>
        <div className="outer-container">
          <Button
            design="Transparent"
            icon="decline"
            className="decline-button"
            onClick={handleToggle}
          />
          <img
            src={busolaModuleCardShape}
            alt="FeaturedCard background shape"
            className="background-shape"
          />
          <img
            src={busolaModuleCardIllustration}
            alt="FeaturedCard Illustration"
            className="illustration"
          />
          <div className="inner-container" style={spacing.sapUiMediumMargin}>
            <Title level="H1">{structure?.title}</Title>
            <Text>{structure?.description}</Text>
            <div
              className="button-container"
              style={spacing.sapUiSmallMarginTop}
            >
              <Button design="Emphasized" className="foreground">
                Add Modules
              </Button>
              {structure?.helpfulLink && (
                <Button
                  icon="inspect"
                  iconEnd
                  className="foreground"
                  onClick={() => {
                    window.open(structure.helpfulLink?.url, '_blank');
                  }}
                >
                  {t('common.buttons.learn-more')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  ) : (
    <></>
  );
}

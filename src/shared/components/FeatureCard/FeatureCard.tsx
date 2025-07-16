import { Button, Card, Text, Title } from '@ui5/webcomponents-react';
import { useEffect, useState } from 'react';
import { isSystemThemeDark, themeState } from 'state/preferences/themeAtom';
import modulesIllustration from './assets/Modules/modulesIllustration.svg';
import modulesIllustrationHC from './assets/Modules/modulesIllustrationHC.svg';
import AiIllustrationLight from './assets/AI/AiIllustrationLight.svg';
import AiIllustrationDark from './assets/AI/AiIllustrationDark.svg';
import AiIllustrationHClight from './assets/AI/AiIllustrationHClight.svg';
import AiIllustrationHCdark from './assets/AI/AiIllustrationHCdark.svg';
import { useRecoilValue } from 'recoil';
import {
  BackgroundStyle,
  DesignType,
  FeatureCardBannerProps,
  IllustrationType,
  ThemeType,
} from './types';

import './FeaturedCard.scss';

const getIllustration = (
  illustration: IllustrationType,
  theme: ThemeType,
): string | null => {
  switch (illustration) {
    case 'None':
      return null;
    case 'AI':
      switch (theme) {
        case 'sap_horizon_hcw':
          return AiIllustrationHClight;
        case 'sap_horizon_hcb':
          return AiIllustrationHCdark;
        case 'sap_horizon':
          return AiIllustrationLight;
        case 'sap_horizon_dark':
          return AiIllustrationDark;
        case 'light_dark':
        default:
          return isSystemThemeDark() ? AiIllustrationDark : AiIllustrationLight;
      }
    case 'Modules':
    default:
      switch (theme) {
        case 'sap_horizon_hcw':
        case 'sap_horizon_hcb':
          return modulesIllustrationHC;
        case 'sap_horizon':
        case 'sap_horizon_dark':
        case 'light_dark':
        default:
          return modulesIllustration;
      }
  }
};

export function FeatureCardBanner({
  id,
  title,
  description,
  design,
  image = '',
  buttons,
  titleIcon,
}: FeatureCardBannerProps) {
  const [hideBanner, setHideBanner] = useState(false);
  const hideBannerKey = `hideBanner${id}`;
  const theme = useRecoilValue(themeState);

  useEffect(() => {
    const storedHideValue = localStorage.getItem(hideBannerKey);
    if (storedHideValue !== null) setHideBanner(storedHideValue === 'true');
  }, [hideBannerKey]);

  if (!id || hideBanner) {
    return <></>;
  }

  const getBackgroundStyle = (design: DesignType): BackgroundStyle => {
    switch (design) {
      case 'information-1':
        return {
          background:
            'linear-gradient(to right, var(--sapLegendBackgroundColor6), var(--sapLegendBackgroundColor5))',
        };
      case 'information-2':
      default:
        return {
          background:
            'linear-gradient(to right, var(--sapLegendBackgroundColor20), var(--sapLegendBackgroundColor5))',
        };
    }
  };

  const handleToggle = () => {
    setHideBanner(true);
    localStorage.setItem(hideBannerKey, 'true');
  };
  const illustration = getIllustration(image, theme);
  return (
    <div className="sap-margin-top-small">
      <Card className="feature-card-container">
        <div className="feature-card" style={getBackgroundStyle(design)}>
          <Button
            design="Transparent"
            icon="decline"
            className="decline-button"
            onClick={handleToggle}
          />
          <div className="outer-container" style={{ margin: '2rem 2.5rem' }}>
            <div className="inner-container">
              <div style={{ width: '100%' }} className="title-container">
                <Title
                  level="H1"
                  size="H1"
                  wrappingType="Normal"
                  style={{
                    display: 'inline-flex',
                  }}
                >
                  {title}
                </Title>
                {titleIcon && (
                  <img
                    src={titleIcon}
                    alt="Title Icon"
                    className="bsl-icon-xxl"
                  />
                )}
              </div>
              <Text>{description}</Text>
              <div className="button-container sap-margin-top-small">
                {buttons && buttons}
              </div>
            </div>
            {illustration && (
              <img
                src={illustration}
                alt="FeaturedCard Illustration"
                className="illustration"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

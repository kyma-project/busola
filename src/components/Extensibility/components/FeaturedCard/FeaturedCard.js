import { Button, Card, Text, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useEffect, useState } from 'react';
import modulesIllustration from './assets/Modules/modulesIllustration.svg';
import modulesIllustrationHC from './assets/Modules/modulesIllustrationHC.svg';
import AiIllustrationLight from './assets/AI/AiIllustrationLight.svg';
import AiIllustrationDark from './assets/AI/AiIllustrationDark.svg';
import AiIllustrationHClight from './assets/AI/AiIllustrationHClight.svg';
import AiIllustrationHCdark from './assets/AI/AiIllustrationHCdark.svg';
import { Widget, InlineWidget } from '../Widget';
import { useRecoilValue } from 'recoil';
import { isSystemThemeDark, themeState } from 'state/preferences/themeAtom';
import './FeaturedCard.scss';

const getIllustration = (illustration, theme) => {
  switch (illustration) {
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

const getBackgroundStyle = design => {
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

export function FeaturedCard({ value, structure, schema, ...props }) {
  const theme = useRecoilValue(themeState);
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

  if (!structure?.id || hideBanner) {
    return <></>;
  }

  return (
    <div style={spacing.sapUiSmallMargin}>
      <Card>
        <div
          className="feature-card"
          style={getBackgroundStyle(structure?.design)}
        >
          <Button
            design="Transparent"
            icon="decline"
            className="decline-button"
            onClick={handleToggle}
          />
          <div className="outer-container" style={{ margin: '2rem 2.5rem' }}>
            <div className="inner-container">
              <Title level="H1" wrappingType="Normal">
                {structure?.title}
              </Title>
              <Text>{structure?.description}</Text>
              <div
                className="button-container"
                style={spacing.sapUiSmallMarginTop}
              >
                {structure.children?.slice(0, 2).map((def, idx) => (
                  <Widget
                    key={idx}
                    value={value}
                    structure={def}
                    schema={schema}
                    inlineRenderer={InlineWidget}
                    inlineContext={true}
                    {...props}
                  />
                ))}
              </div>
            </div>
            <img
              src={getIllustration(structure?.illustration, theme)}
              alt="FeaturedCard Illustration"
              className="illustration"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

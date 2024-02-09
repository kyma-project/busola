import { Button, Card, Text, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { useEffect, useState } from 'react';
import cardIllustration from './assets/cardIllustration.svg';
import cardIllustrationHC from './assets/cardIllustrationHC.svg';
import { Widget, InlineWidget } from '../Widget';
import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import './FeaturedCard.scss';

const getIllustration = theme => {
  switch (theme) {
    case 'sap_horizon_hcw':
    case 'sap_horizon_hcb':
      return cardIllustrationHC;
    case 'sap_horizon':
    case 'sap_horizon_dark':
    case 'light_dark':
    default:
      return cardIllustration;
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

  if (!structure?.id) return <></>;
  return !hideBanner ? (
    <div style={spacing.sapUiSmallMargin}>
      <Card>
        <div className="feature-card-background">
          <Button
            design="Transparent"
            icon="decline"
            className="decline-button"
            onClick={handleToggle}
          />
          <div className="outer-container" style={spacing.sapUiMediumMargin}>
            <div className="inner-container">
              <Title level="H1" wrappingType="Normal">
                {structure?.title}
              </Title>
              <Text>{structure?.description}</Text>
              <div
                className="button-container"
                style={spacing.sapUiSmallMarginTop}
              >
                {structure.children.slice(0, 2).map((def, idx) => (
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
              src={getIllustration(theme)}
              alt="FeaturedCard Illustration"
              className="illustration"
            />
          </div>
        </div>
      </Card>
    </div>
  ) : (
    <></>
  );
}

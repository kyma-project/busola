import { Button, FlexBox, Link, Text } from '@ui5/webcomponents-react';
import { useTranslation, Trans } from 'react-i18next';
import JouleIcon from '../JouleIcon';
import './Disclaimer.scss';

interface DisclaimerProps {
  hideDisclaimer: () => void;
}

export default function Disclaimer({ hideDisclaimer }: DisclaimerProps) {
  const { t } = useTranslation();

  return (
    <div className="disclaimer">
      <FlexBox
        id="content-container"
        direction="Column"
        justifyContent="Center"
        alignItems="Center"
        gap={16}
      >
        <JouleIcon size={4} />
        <Text id="disclaimer-title">
          {t('kyma-companion.disclaimer.title')}
        </Text>
        <Text id="disclaimer-text">
          <Trans
            i18nKey="kyma-companion.disclaimer.text"
            components={[
              <Link
                href="https://help.sap.com/docs/joule/serviceguide/data-protection-and-privacy"
                design="Subtle"
                target="_blank"
              />,
            ]}
          />
        </Text>
        <Button
          className="sap-margin-top-small"
          onClick={hideDisclaimer}
          icon="discussion"
        >
          {t('kyma-companion.disclaimer.back-conversation')}
        </Button>
      </FlexBox>
    </div>
  );
}

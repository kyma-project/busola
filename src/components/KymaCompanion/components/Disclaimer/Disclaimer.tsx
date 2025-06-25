import { Button, FlexBox, Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
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
        <Text id="disclaimer-text">{t('kyma-companion.disclaimer.text')}</Text>
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

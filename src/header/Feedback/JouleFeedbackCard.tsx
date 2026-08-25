import { Button, FlexBox, Text, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

type Props = {
  feedbackLink: string;
};

export function JouleFeedbackCard({ feedbackLink }: Props) {
  const { t } = useTranslation();

  return (
    <FlexBox
      alignItems="Start"
      direction="Column"
      justifyContent="Start"
      gap={16}
      className="sap-margin-bottom-medium"
    >
      <Title level="H6" size="H6">
        {t('feedback.joule.title')}
      </Title>
      <Text className="info-text">{t('feedback.joule.info')}</Text>
      <Button
        accessibleRole="Link"
        accessibleName={t('feedback.give-feedback')}
        accessibleDescription="Open in new tab link"
        design="Default"
        endIcon="inspect"
        onClick={() => {
          const newWindow = window.open(
            feedbackLink,
            '_blank',
            'noopener, noreferrer',
          );
          if (newWindow) newWindow.opener = null;
        }}
      >
        {t('feedback.give-feedback')}
      </Button>
    </FlexBox>
  );
}

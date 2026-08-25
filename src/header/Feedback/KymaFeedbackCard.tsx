import { Button, FlexBox, Text, Title } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

type Props = {
  feedbackLink: string;
};

export function KymaFeedbackCard({ feedbackLink }: Props) {
  const { t } = useTranslation();

  return (
    <FlexBox
      alignItems="Start"
      direction="Column"
      justifyContent="Start"
      gap={16}
    >
      <Title level="H6" size="H6">
        {t('feedback.kyma.title')}
      </Title>
      <Text className="info-text">{t('feedback.kyma.info')}</Text>
      <Button
        accessibleRole="Link"
        accessibleName={t('feedback.give-feedback')}
        accessibleDescription="Open in new tab link"
        endIcon="inspect"
        design="Default"
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

import {
  Button,
  FlexBox,
  ObjectStatus,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

type Props = {
  signUpLink: string | undefined;
  showNewIndicators: boolean;
  emphasized: boolean;
  onSignUp: () => void;
};

export function KymaSurveyCard({
  signUpLink,
  showNewIndicators,
  emphasized,
  onSignUp,
}: Props) {
  const { t } = useTranslation();

  return (
    <FlexBox
      alignItems="Start"
      direction="Column"
      justifyContent="Start"
      gap={16}
      className="sap-margin-bottom-medium"
    >
      <FlexBox
        direction="Row"
        alignItems="Center"
        justifyContent="Start"
        gap={12}
      >
        <Title level="H6" size="H6">
          {t('feedback.kyma-survey.title')}
        </Title>
        {showNewIndicators && (
          <ObjectStatus state="Information" inverted>
            {t('feedback.new')}
          </ObjectStatus>
        )}
      </FlexBox>
      <Text className="info-text">{t('feedback.kyma-survey.info')}</Text>
      <Button
        accessibleRole="Link"
        accessibleName={t('feedback.sign-up')}
        accessibleDescription="Open in new tab link"
        endIcon="inspect"
        design={emphasized ? 'Emphasized' : 'Default'}
        onClick={() => {
          onSignUp();
          const newWindow = window.open(
            signUpLink,
            '_blank',
            'noopener, noreferrer',
          );
          if (newWindow) newWindow.opener = null;
        }}
      >
        {t('feedback.sign-up')}
      </Button>
    </FlexBox>
  );
}

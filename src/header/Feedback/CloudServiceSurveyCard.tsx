import {
  Button,
  FlexBox,
  Icon,
  ObjectStatus,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

type Props = {
  signUpLink: string | undefined;
  showNewIndicators: boolean;
  onSignUp: () => void;
};

export function CloudServiceSurveyCard({
  signUpLink,
  showNewIndicators,
  onSignUp,
}: Props) {
  const { t } = useTranslation();

  return (
    <FlexBox
      alignItems="Stretch"
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
          {t('feedback.cloud-services-survey.title')}
        </Title>
        {showNewIndicators && (
          <ObjectStatus state="Information" inverted>
            {t('feedback.new')}
          </ObjectStatus>
        )}
      </FlexBox>
      <Text className="info-text">
        {t('feedback.cloud-services-survey.info')}
      </Text>
      <Button
        accessibleRole="Link"
        accessibleName={t('feedback.sign-up')}
        accessibleDescription="Open in new tab link"
        design="Emphasized"
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
        <Icon
          name="inspect"
          className="sap-margin-begin-tiny"
          style={{ color: 'inherit' }}
        />
      </Button>
    </FlexBox>
  );
}

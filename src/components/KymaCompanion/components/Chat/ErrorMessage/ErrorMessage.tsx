import {
  Button,
  Card,
  IllustratedMessage,
  Text,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  errorMessage: string;
  displayRetry: boolean;
  retryPrompt: () => void;
}

export default function ErrorMessage({
  errorMessage,
  displayRetry,
  retryPrompt,
}: ErrorMessageProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="sap-margin-x-tiny sap-margin-bottom-small">
      <Card>
        <IllustratedMessage
          name="Connection"
          design="Spot"
          key="error-message"
          titleText={t('kyma-companion.error.title')}
          subtitle={
            <Text className="sap-margin-bottom-tiny">{errorMessage}</Text>
          }
          className="sap-margin-top-small no-padding"
        >
          {displayRetry && (
            <Button
              onClick={retryPrompt}
              design="Emphasized"
              className="sap-margin-bottom-tiny"
            >
              {t('common.buttons.retry')}
            </Button>
          )}
        </IllustratedMessage>
      </Card>
    </div>
  );
}

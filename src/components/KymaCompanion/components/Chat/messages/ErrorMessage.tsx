import { Button, Card, IllustratedMessage } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  errorMessage: string;
  errorOnInitialMessage: boolean;
  retryPrompt: () => void;
}

export default function ErrorMessage({
  errorMessage,
  errorOnInitialMessage,
  retryPrompt,
}: ErrorMessageProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="sap-margin-x-tiny sap-margin-y-small">
      <Card>
        <IllustratedMessage
          name="Connection"
          key="error-message"
          titleText={t('kyma-companion.error.title')}
          subtitleText={errorMessage}
          className="sap-margin-top-small no-padding"
        >
          {errorOnInitialMessage && (
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

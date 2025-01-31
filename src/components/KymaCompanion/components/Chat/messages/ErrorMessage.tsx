import { Button, Card, IllustratedMessage } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  errorOnInitialMessage: boolean;
  resendInitialPrompt: () => void;
}

export default function ErrorMessage({
  errorOnInitialMessage,
  resendInitialPrompt,
}: ErrorMessageProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="sap-margin-x-tiny sap-margin-y-small">
      <Card>
        <IllustratedMessage
          name="Connection"
          key="error-message"
          titleText={t('kyma-companion.error.title')}
          subtitleText={t('kyma-companion.error.subtitle')}
          className="sap-margin-top-small no-padding"
        >
          {errorOnInitialMessage && (
            <Button
              onClick={resendInitialPrompt}
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

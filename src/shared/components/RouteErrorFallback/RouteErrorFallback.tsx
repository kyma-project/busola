import { Button, IllustratedMessage } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

export function RouteErrorFallback() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <IllustratedMessage
        name="UnableToLoad"
        titleText={t('err-boundary.sth-went-wrong')}
        subtitleText={t('err-boundary.reload-page')}
      >
        <Button onClick={() => window.location.reload()}>
          {t('err-boundary.reload')}
        </Button>
      </IllustratedMessage>
    </div>
  );
}

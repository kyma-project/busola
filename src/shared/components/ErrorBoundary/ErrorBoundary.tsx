import { Bar, Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { ReactNode } from 'react';

interface ErrorFallbackProps {
  resetError: () => void;
  customMessage?: string;
  displayButton?: boolean;
  onClose?: () => void;
  t: (key: string) => string;
}

interface ErrorBoundaryProps {
  displayButton?: boolean;
  customMessage?: string;
  onClose?: () => void;
  children: ReactNode;
}

const ErrorFallback = ({
  resetError,
  customMessage,
  displayButton,
  onClose,
  t,
}: ErrorFallbackProps) => (
  <>
    <div
      role="alert"
      style={{ width: '90vh', height: '70vh' }}
      className="sap-margin-medium"
    >
      <p className="bsl-color--text sap-margin-y-small">
        {customMessage || t('err-boundary.restored-initial-form')}
      </p>

      {displayButton && (
        <Button onClick={resetError}>{t('err-boundary.go-back')}</Button>
      )}
    </div>
    {onClose && (
      <Bar
        design="Footer"
        endContent={
          <Button onClick={onClose}>{t('common.buttons.close')}</Button>
        }
      />
    )}
  </>
);

export const ErrorBoundary = ({
  displayButton = true,
  customMessage,
  onClose,
  children,
}: ErrorBoundaryProps) => {
  const { t } = useTranslation();

  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <ErrorFallback
          resetError={resetError}
          customMessage={customMessage}
          displayButton={displayButton}
          onClose={onClose}
          t={t}
        />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

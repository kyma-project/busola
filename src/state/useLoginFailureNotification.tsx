import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { useNotification } from 'shared/contexts/NotificationContext';
import { OidcErrorParams } from './utils/oidcCallbackDecision';

// Shows a stopped login in the error modal, onRetry adds a Retry button.
export function useNotifyLoginFailure() {
  const notification = useNotification();
  const { t } = useTranslation();

  return useCallback(
    (failure?: OidcErrorParams, { onRetry }: { onRetry?: () => void } = {}) => {
      const content = failure
        ? [
            t(
              failure.fromIdp
                ? 'common.errors.idp-rejected-login'
                : 'common.errors.login-error',
              { error: failure.error },
            ),
            failure.errorDescription,
          ]
            .filter(Boolean)
            .join(' ')
        : t('common.errors.login-loop-stopped');

      notification.notifyError({
        header: t('common.errors.login-failed'),
        content,
        actions: onRetry
          ? (close, defaultCloseButton) => [
              <Button
                key="retry"
                design="Emphasized"
                onClick={() => {
                  close();
                  onRetry();
                }}
              >
                {t('common.buttons.retry')}
              </Button>,
              defaultCloseButton(close),
            ]
          : undefined,
      });
    },
    [notification, t],
  );
}

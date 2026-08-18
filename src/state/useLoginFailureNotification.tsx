import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { useNotification } from 'shared/contexts/NotificationContext';

// Shows a stopped login in the error modal, onRetry adds a Retry button.
export function useNotifyLoginFailure() {
  const notification = useNotification();
  const { t } = useTranslation();

  return useCallback(
    ({ onRetry }: { onRetry?: () => void } = {}) => {
      notification.notifyError({
        header: t('common.errors.login-failed'),
        content: t('common.errors.login-loop-stopped'),
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

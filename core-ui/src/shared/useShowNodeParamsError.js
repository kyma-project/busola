import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';

export function useShowNodeParamsError() {
  const nodeParams = LuigiClient.getNodeParams();
  const notification = useNotification();
  const { t } = useTranslation();

  React.useEffect(() => {
    function showError({ error, errorDescription }) {
      const description = errorDescription ? ` (${errorDescription})` : '';
      notification.notifyError({
        title: t(
          'event-subscription.create.notifications.failed-to-add-cluster',
        ),
        content: `Error: ${error}${description}`,
      });
    }

    if (nodeParams.error) {
      showError(nodeParams);
    }
  }, [nodeParams, notification, t]);
}

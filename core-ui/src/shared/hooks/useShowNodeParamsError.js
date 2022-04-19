import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { useNotification } from 'shared/contexts/NotificationContext';

export function useShowNodeParamsError() {
  const nodeParams = LuigiClient.getNodeParams();
  const notification = useNotification();
  const { t } = useTranslation();

  React.useEffect(() => {
    function showError({ error, errorDescription }) {
      const description = errorDescription ? ` (${errorDescription})` : '';
      notification.notifyError({
        title: t('clusters.add.errors.failed-to-add-cluster'),
        content: `${t('common.tooltips.error')}${error}${description}`,
      });
    }

    if (nodeParams.error) {
      showError(nodeParams);
    }
  }, [nodeParams, notification, t]);
}

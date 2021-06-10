import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';

export function useShowNodeParamsError() {
  const notification = useNotification();

  const nodeParams = LuigiClient.getNodeParams();

  React.useEffect(() => {
    function showError({ error, errorDescription }) {
      const description = errorDescription ? ` (${errorDescription})` : '';
      notification.notifyError({
        title: 'Failed to add cluster',
        content: `Error: ${error}${description}`,
      });
    }

    if (nodeParams.error) {
      showError(nodeParams);
    }
  }, [nodeParams, notification]);
}

import LuigiClient from '@luigi-project/client';

import { useDelete, handleDelete, useNotification } from 'react-shared';
import { formatMessage as injectVariables } from 'components/Lambdas/helpers/misc';
import { API_RULE_URL } from '../constants';

export function useDeleteApiRule() {
  const notification = useNotification();
  const namespace = LuigiClient.getContext().namespaceId;

  const deleteAPIRule = useDelete();

  async function handleResourceDelete(name, t) {
    return await handleDelete(
      'apirules',
      null,
      name,
      notification,
      () =>
        deleteAPIRule(
          injectVariables(API_RULE_URL, {
            namespace: namespace,
            name: name,
          }),
        ),
      () => {},
      t,
    );
  }

  return handleResourceDelete;
}

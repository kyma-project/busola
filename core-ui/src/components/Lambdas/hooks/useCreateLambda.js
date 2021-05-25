import { useNotification, usePost } from 'react-shared';
import LuigiClient from '@luigi-project/client';

import { createLambdaInput } from './createLambdaInput';

import { formatMessage } from 'components/Lambdas/helpers/misc';

export const useCreateLambda = ({ redirect = true }) => {
  const notificationManager = useNotification();
  const postRequest = usePost();

  function handleError(error) {
    notificationManager.notifyError({
      title: 'Failed to create the Function',
      content: error.message,
      autoClose: false,
    });
  }

  async function createLambda({ name, namespace, inputData }) {
    const input = createLambdaInput(name, namespace, inputData);
    try {
      await postRequest(
        `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespace}/functions`,
        input,
      );

      const message = formatMessage('Function created');

      notificationManager.notifySuccess({
        content: message,
      });

      if (redirect) {
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(`functions/details/${name}`);
      }
    } catch (err) {
      handleError(err);
    }
  }

  return createLambda;
};

import { useNotification, usePost } from 'react-shared';

import extractErrors from 'shared/errorExtractor';

import { formatMessage } from 'components/Lambdas/helpers/misc';

import { LAMBDAS_MESSAGES } from 'components/Lambdas/constants';

export const useCreateRepository = () => {
  const notificationManager = useNotification();
  const postRequest = usePost();

  function handleError(name, error) {
    const errorToDisplay = extractErrors(error);

    const message = formatMessage(
      LAMBDAS_MESSAGES.CREATE_REPOSITORY.ERROR_MESSAGE,
      {
        repositoryName: name,
        error: errorToDisplay,
      },
    );

    notificationManager.notifyError({
      title: 'Failed to create the Repository',
      content: message,
      autoClose: false,
    });
  }

  async function createRepository({ name, namespace, spec }) {
    try {
      await postRequest(
        `/apis/serverless.kyma-project.io/v1alpha1/namespaces/${namespace}/gitrepositories/${name}`,
        {
          apiVersion: 'serverless.kyma-project.io/v1alpha1',
          kind: 'GitRepository',
          metadata: {
            name,
            namespace,
          },
          spec: spec,
        },
      );

      const message = formatMessage(
        LAMBDAS_MESSAGES.CREATE_REPOSITORY.SUCCESS_MESSAGE,
        {
          repositoryName: name,
        },
      );

      notificationManager.notifySuccess({
        content: message,
      });
    } catch (err) {
      handleError(name, err);
    }
  }

  return createRepository;
};

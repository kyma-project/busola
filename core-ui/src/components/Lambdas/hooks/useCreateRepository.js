import { useNotification, usePost } from 'react-shared';

import extractErrors from 'shared/errorExtractor';

export const useCreateRepository = () => {
  const notificationManager = useNotification();
  const postRequest = usePost();

  function handleError(error) {
    const errorToDisplay = extractErrors(error);

    notificationManager.notifyError({
      title: 'Failed to create the Repository',
      content: errorToDisplay,
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

      notificationManager.notifySuccess({
        content: 'Repository created',
      });
    } catch (err) {
      handleError(err);
    }
  }

  return createRepository;
};

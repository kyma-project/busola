import { useNotification, useUpdate } from 'react-shared';

import { createPatch } from 'rfc6902';

import extractErrors from 'shared/errorExtractor';

import { formatMessage } from 'components/Lambdas/helpers/misc';
import { LAMBDAS_MESSAGES } from 'components/Lambdas/constants';
import { getResourceUrl } from 'shared/helpers';

export const UPDATE_TYPE = {
  GENERAL_CONFIGURATION: 'GENERAL_CONFIGURATION',
  CODE_AND_DEPENDENCIES: 'CODE_AND_DEPENDENCIES',
  REPOSITORY_CONFIG: 'REPOSITORY_CONFIG',
  RESOURCES_AND_REPLICAS: 'RESOURCES_AND_REPLICAS',
  VARIABLES: 'VARIABLES',
};

export const useUpdateLambda = ({
  lambda,
  type = UPDATE_TYPE.GENERAL_CONFIGURATION,
}) => {
  const notificationManager = useNotification();
  const updateLambda = useUpdate();

  function handleError(error) {
    const errorToDisplay = extractErrors(error);

    const message = formatMessage(
      LAMBDAS_MESSAGES.UPDATE_LAMBDA[type].ERROR_MESSAGE,
      {
        lambdaName: lambda.metadata.name,
        error: errorToDisplay,
      },
    );

    notificationManager.notifyError({
      content: message,
      autoClose: false,
    });
  }

  async function handleUpdateLambda(updatedData, userCallback = () => {}) {
    const url = getResourceUrl();

    try {
      const newLambda = {
        ...lambda,
        ...updatedData,
      };

      const diff = createPatch(lambda, newLambda);

      const response = await updateLambda(url, diff);

      if (response.error) {
        handleError(response.error);
        return;
      }

      const message = formatMessage(
        LAMBDAS_MESSAGES.UPDATE_LAMBDA[type].SUCCESS_MESSAGE,
        {
          lambdaName: lambda.metadata.name,
        },
      );

      notificationManager.notifySuccess({
        content: message,
      });
      userCallback({ ok: true });
    } catch (err) {
      handleError(err);
      userCallback({ ok: false });
    }
  }

  return handleUpdateLambda;
};

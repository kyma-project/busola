import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';

import { createPatch } from 'rfc6902';

import extractErrors from 'shared/errorExtractor';
import { getResourceUrl } from 'shared/helpers';

export const UPDATE_TYPE = {
  GENERAL_CONFIGURATION: 'GENERAL_CONFIGURATION',
  CODE_AND_DEPENDENCIES: 'CODE_AND_DEPENDENCIES',
  REPOSITORY_CONFIG: 'REPOSITORY_CONFIG',
  RESOURCES_AND_REPLICAS: 'RESOURCES_AND_REPLICAS',
  VARIABLES: 'VARIABLES',
};

export const useUpdateFunction = ({
  func,
  type = UPDATE_TYPE.GENERAL_CONFIGURATION,
}) => {
  const notificationManager = useNotification();
  const updateFunction = useUpdate();

  function handleError(error) {
    const errorToDisplay = extractErrors(error);

    notificationManager.notifyError({
      title: 'Failed to update the Function',
      content: errorToDisplay,
      autoClose: false,
    });
  }

  async function handleUpdateFunction(updatedData, userCallback = () => {}) {
    const url = getResourceUrl();

    try {
      const newFunction = {
        ...func,
        ...updatedData,
      };

      const diff = createPatch(func, newFunction);

      const response = await updateFunction(url, diff);

      if (response.error) {
        handleError(response.error);
        return;
      }

      notificationManager.notifySuccess({
        content: 'Function updated',
      });
      userCallback({ ok: true });
    } catch (err) {
      handleError(err);
      userCallback({ ok: false });
    }
  }

  return handleUpdateFunction;
};

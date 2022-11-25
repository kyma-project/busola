import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { usePut, useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { navigateToResourceAfterCreate } from 'shared/hooks/navigate';
import { createPatch } from 'rfc6902';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { Button } from 'fundamental-react';
import { ForceUpdateModalContent } from './ForceUpdateModalContent';

export function useCreateResource({
  singularName,
  pluralKind,
  resource,
  initialResource,
  createUrl,
  afterCreatedFn,
  toggleFormFn,
  urlPath,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const getRequest = useSingleGet();
  const postRequest = usePost();
  const putRequest = usePut();
  const patchRequest = useUpdate();
  const { namespaceId } = useMicrofrontendContext();
  const isEdit = !!initialResource?.metadata?.name;

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content: t(
        isEdit
          ? 'common.create-form.messages.patch-success'
          : 'common.create-form.messages.create-success',
        {
          resourceType: singularName,
        },
      ),
    });
    if (!isEdit)
      navigateToResourceAfterCreate(
        namespaceId,
        resource.metadata.name,
        urlPath || pluralKind.toLowerCase(),
      );
  };

  const showError = error => {
    console.error(error);
    notification.notifyError({
      content: t(
        isEdit
          ? 'common.create-form.messages.patch-failure'
          : 'common.create-form.messages.create-failure',
        {
          resourceType: singularName,
          error: error.message,
        },
      ),
    });
  };

  const onSuccess = () => {
    if (afterCreatedFn) {
      afterCreatedFn(defaultAfterCreatedFn);
    } else {
      defaultAfterCreatedFn();
    }
  };

  return async e => {
    if (e) {
      e.preventDefault();
    }

    console.log({
      i: initialResource.metadata.resourceVersion,
      r: resource.metadata.resourceVersion,
    });
    const mergedResource = {
      ...initialResource,
      ...resource,
      metadata: { ...initialResource.metadata, ...resource.metadata },
    };
    try {
      if (isEdit) {
        await patchRequest(
          createUrl,
          createPatch(initialResource, mergedResource),
        );
        if (typeof toggleFormFn === 'function') {
          toggleFormFn(false);
        }
      } else {
        await postRequest(createUrl, resource);
        if (typeof toggleFormFn === 'function') {
          toggleFormFn(false);
        }
      }

      onSuccess();
    } catch (e) {
      const isConflict = e instanceof HttpError && e.code === 409;
      if (isConflict && isEdit) {
        const response = await getRequest(createUrl);
        const updatedResource = await response.json();

        const makeForceUpdateFn = closeModal => {
          return async () => {
            delete mergedResource?.metadata?.resourceVersion;
            try {
              await putRequest(createUrl, mergedResource);
              closeModal();
              onSuccess();
              if (typeof toggleFormFn === 'function') {
                toggleFormFn(false);
              }
            } catch (e) {
              showError(e);
            }
          };
        };

        notification.notifyError({
          content: (
            <ForceUpdateModalContent
              error={e}
              singularName={singularName}
              initialResource={updatedResource}
              modifiedResource={mergedResource}
            />
          ),
          actions: (closeModal, defaultCloseButton) => [
            <Button compact onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        showError(e);
        return false;
      }
    }
  };
}

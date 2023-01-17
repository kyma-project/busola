import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { createPatch } from 'rfc6902';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { Button } from 'fundamental-react';
import { ForceUpdateModalContent } from './ForceUpdateModalContent';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router-dom';

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
  const patchRequest = useUpdate();
  const { scopedUrl } = useUrl();
  const navigate = useNavigate();

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
    if (!isEdit) {
      navigate(
        scopedUrl(
          `${urlPath || pluralKind.toLowerCase()}/${encodeURIComponent(
            resource.metadata.name,
          )}`,
        ),
      );
    }
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
    const mergedResource = {
      ...initialResource,
      ...resource,
      metadata: {
        ...initialResource?.metadata,
        ...resource.metadata,
      },
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
            mergedResource.metadata.resourceVersion =
              initialResource?.metadata.resourceVersion;
            try {
              await patchRequest(
                createUrl,
                createPatch(initialResource, mergedResource),
              );
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

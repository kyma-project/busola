import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { navigateToDetails } from 'shared/hooks/navigate';
import { createPatch } from 'rfc6902';

export function useCreateResource({
  singularName,
  pluralKind,
  resource,
  initialResource,
  createUrl,
  afterCreatedFn,
  toggleFormFn,
}) {
  const { t } = useTranslation();
  const notification = useNotification();

  const postRequest = usePost();
  const patchRequest = useUpdate();

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
    if (!isEdit) navigateToDetails(pluralKind, resource.metadata.name);
  };

  return async e => {
    if (e) {
      e.preventDefault();
    }

    try {
      if (isEdit) {
        const mergedResource = {
          ...initialResource,
          ...resource,
          metadata: { ...initialResource.metadata, ...resource.metadata },
        };
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

      if (afterCreatedFn) {
        afterCreatedFn(defaultAfterCreatedFn);
      } else {
        defaultAfterCreatedFn();
      }
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t(
          isEdit
            ? 'common.create-form.messages.patch-failure'
            : 'common.create-form.messages.create-failure',
          {
            resourceType: singularName,
            error: e.message,
          },
        ),
      });
      return false;
    }
  };
}

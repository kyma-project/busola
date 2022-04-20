import LuigiClient from '@luigi-project/client';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { createPatch } from 'rfc6902';

export function useCreateResource({
  singularName,
  pluralKind,
  resource,
  initialResource,
  createUrl,
  afterCreatedFn,
  setShowEditDialog,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const { namespaceId } = useMicrofrontendContext();
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
    if (!isEdit) {
      if (namespaceId) {
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(
            `/${pluralKind.toLowerCase()}/details/${resource.metadata.name}`,
          );
      } else {
        LuigiClient.linkManager().navigate(`details/${resource.metadata.name}`);
      }
    }
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
          metadata: {
            ...initialResource.metadata,
            ...resource.metadata,
          },
        };
        await patchRequest(
          createUrl,
          createPatch(initialResource, mergedResource),
        );
      } else {
        await postRequest(createUrl, resource);
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

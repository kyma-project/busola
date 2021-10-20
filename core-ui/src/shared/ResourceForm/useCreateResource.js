import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { usePost, useUpdate } from 'react-shared';
import { createPatch } from 'rfc6902';

export function useCreateResource(
  singularName,
  pluralKind,
  resource,
  initialResource,
  createUrl,
  afterCreatedFn,
) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const patchRequest = useUpdate();

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content: t(
        initialResource
          ? 'common.create-form.messages.patch-success'
          : 'common.create-form.messages.create-success',
        {
          resourceType: singularName,
        },
      ),
    });
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(
        `/${pluralKind.toLowerCase()}/details/${resource.metadata.name}`,
      );
  };

  return async () => {
    try {
      if (initialResource) {
        const mergedResource = {
          ...initialResource,
          ...resource,
          metadata: { ...initialResource.metadata, ...resource.metadata },
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
          initialResource
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

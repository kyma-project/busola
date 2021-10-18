import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { usePost, useMicrofrontendContext } from 'react-shared';

export function useCreateResource(
  singularName,
  pluralKind,
  resource,
  createUrl,
  afterCreatedFn,
) {
  const { t } = useTranslation();
  const notification = useNotification();
  const { namespaceId } = useMicrofrontendContext();
  const postRequest = usePost();

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content: t('common.create-form.messages.success', {
        resourceType: singularName,
      }),
    });
    if (namespaceId) {
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(
          `/${pluralKind.toLowerCase()}/details/${resource.metadata.name}`,
        );
    } else {
      LuigiClient.linkManager().navigate(`details/${resource.metadata.name}`);
    }
  };

  return async () => {
    try {
      await postRequest(createUrl, resource);
      if (afterCreatedFn) {
        afterCreatedFn(defaultAfterCreatedFn);
      } else {
        defaultAfterCreatedFn();
      }
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('common.create-form.messages.failure', {
          resourceType: singularName,
          error: e.message,
        }),
      });
      return false;
    }
  };
}

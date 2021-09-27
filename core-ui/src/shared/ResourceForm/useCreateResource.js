import LuigiClient from '@luigi-project/client';
import { useNotification } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { usePost } from 'react-shared';

export function useCreateResource(
  singularName,
  pluralKind,
  resource,
  createUrl,
  afterCreatedFn,
) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content: t('common.create-form.messages.success', {
        resourceType: singularName,
      }),
    });
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(
        `/${pluralKind.toLowerCase()}/details/${resource.metadata.name}`,
      );
  };

  return async () => {
    console.log('yeah');
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

import {
  useUpdate,
  useNotification,
  useProtectedResources,
} from 'react-shared';
import * as jp from 'jsonpath';
import { createPatch } from 'rfc6902';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

export function useRestartResource(baseUrl) {
  const { t } = useTranslation();
  const patchRequest = useUpdate();
  const notification = useNotification();

  return async resource => {
    const url = baseUrl + '/' + resource.metadata.name;
    const updatedResource = cloneDeep(resource);
    jp.value(
      updatedResource,
      "$.spec.template.metadata.annotations['kubectl.kubernetes.io/restartedAt']",
      new Date().toISOString(),
    );
    try {
      await patchRequest(url, createPatch(resource, updatedResource));
      notification.notifySuccess({
        content: t('common.messages.restart-success'),
      });
    } catch (e) {
      console.warn(e);
      notification.notifyError({
        title: t('common.messages.restart-failure'),
        content: t('common.messages.error', { error: e.message }),
      });
    }
  };
}

export function useRestartAction(baseUrl) {
  const { t, i18n } = useTranslation();
  const { isProtected } = useProtectedResources(i18n);
  const restartResource = useRestartResource(baseUrl);

  return {
    name: t('common.buttons.restart'),
    icon: 'refresh',
    tooltip: t('common.buttons.restart'),
    disabledHandler: isProtected,
    handler: restartResource,
  };
}

import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { useProtectedResources } from 'shared/hooks/useProtectedResources';
import { useNotification } from 'shared/contexts/NotificationContext';
import jp from 'jsonpath';
import pluralize from 'pluralize';
import { createPatch } from 'rfc6902';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';

export function useRestartResource(baseUrl, namespace) {
  const { t } = useTranslation();
  const patchRequest = useUpdate();
  const notification = useNotification();

  return async (resource) => {
    const url =
      namespace === '-all-'
        ? `/apis/${resource.apiVersion}/namespaces/${resource.metadata.namespace}/${pluralize(resource.kind?.toLowerCase())}/${resource.metadata.name}`
        : baseUrl + '/' + resource.metadata.name;

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

export function useRestartAction(baseUrl, namespace) {
  const { t } = useTranslation();
  const { isProtected } = useProtectedResources();
  const restartResource = useRestartResource(baseUrl, namespace);

  return {
    name: t('common.buttons.restart'),
    icon: 'refresh',
    tooltip: (entry) =>
      isProtected(entry)
        ? t('common.tooltips.protected-resources-info')
        : t('common.buttons.restart'),
    disabledHandler: isProtected,
    handler: restartResource,
  };
}

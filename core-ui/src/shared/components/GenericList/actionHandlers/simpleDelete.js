import LuigiClient from '@luigi-project/client';
import { prettifyNameSingular } from 'shared/utils/helpers';

function displayConfirmationMessage({ entityType, entityName, t }) {
  return new Promise(resolve => {
    LuigiClient.uxManager()
      .showConfirmationModal({
        header: t('components.generic-list.acion-header.title', {
          resourceType: prettifyNameSingular(entityType),
        }),
        body: t('components.generic-list.acion-header.messages.confirmation', {
          resourceType: prettifyNameSingular(entityType),
          name: entityName,
        }),
        buttonConfirm: t('common.buttons.delete'),
        buttonDismiss: t('common.buttons.cancel'),
      })
      .then(() => resolve(true))
      .catch(_e => resolve(false));
  });
}

export async function handleDelete(
  entityType,
  entityId,
  entityName,
  notificationManager,
  deleteRequestFn,
  callback = () => {},
  t,
) {
  try {
    if (await displayConfirmationMessage({ entityType, entityName, t })) {
      await deleteRequestFn(entityId, entityName);
      callback();
      notificationManager.notifySuccess({
        content: t('components.generic-list.acion-header.messages.success', {
          resourceType: prettifyNameSingular(entityType),
        }),
      });
    }
  } catch (e) {
    notificationManager.notifyError({
      content: t('components.generic-list.acion-header.messages.failure', {
        resourceType: prettifyNameSingular(entityType),
        error: e.message,
      }),
    });
  }
}

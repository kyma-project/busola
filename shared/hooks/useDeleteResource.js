import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, MessageBox, MessageStrip } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

import {
  useDelete,
  useNotification,
  navigateToList,
  prettifyNameSingular,
} from '..';
import { useFeatureToggle } from '.';

export function useDeleteResource({
  i18n,
  resourceType,
  navigateToListAfterDelete = false,
}) {
  const { t } = useTranslation(['translation'], { i18n });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteResourceMutation = useDelete();
  const [dontConfirmDelete, setDontConfirmDelete] = useFeatureToggle(
    'dontConfirmDelete',
  );

  const notification = useNotification();

  const prettifiedResourceName = prettifyNameSingular(undefined, resourceType);

  const performDelete = async (resource, resourceUrl, deleteFn) => {
    const withoutQueryString = path => path?.split('?')?.[0];
    const url = withoutQueryString(resourceUrl);

    LuigiClient.sendCustomMessage({
      id: 'busola.dontConfirmDelete',
      value: dontConfirmDelete,
    });
    try {
      if (deleteFn) {
        deleteFn(resource, url);
      } else {
        await deleteResourceMutation(url);
        notification.notifySuccess({
          content: t('components.resources-list.messages.delete.success', {
            resourceType: prettifiedResourceName,
          }),
        });
        if (navigateToListAfterDelete) navigateToList(resourceType);
      }
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('components.resources-list.messages.delete.failure', {
          resourceType: prettifiedResourceName,
          error: e.message,
        }),
      });
      throw e;
    }
  };

  const closeDeleteDialog = () => {
    LuigiClient.uxManager().removeBackdrop();
    setShowDeleteDialog(false);
  };

  async function handleResourceDelete({ resource, resourceUrl, deleteFn }) {
    if (dontConfirmDelete) {
      performDelete(resource, resourceUrl, deleteFn);
    } else {
      LuigiClient.uxManager().addBackdrop();
      setShowDeleteDialog(true);
    }
  }

  const DeleteMessageBox = ({
    resource,
    resourceName,
    resourceUrl,
    deleteFn,
  }) => (
    <MessageBox
      type="warning"
      title={t('common.delete-dialog.title', {
        name: resourceName || resource?.metadata?.name,
      })}
      actions={[
        <Button
          data-testid="delete-confirmation"
          type="negative"
          compact
          onClick={() => performDelete(resource, resourceUrl, deleteFn)}
        >
          {t('common.buttons.delete')}
        </Button>,
        <Button onClick={() => setDontConfirmDelete(false)} compact>
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      show={showDeleteDialog}
      onClose={closeDeleteDialog}
    >
      <p>
        {t('common.delete-dialog.message', {
          type: prettifiedResourceName,
          name: resourceName || resource?.metadata?.name,
        })}
      </p>
      <div className="fd-margin-top--sm">
        <Checkbox onChange={e => setDontConfirmDelete(e.target.checked)}>
          {t('common.delete-dialog.delete-confirm')}
        </Checkbox>
      </div>
      {dontConfirmDelete && (
        <MessageStrip type="information" className="fd-margin-top--sm">
          {t('common.delete-dialog.information')}
        </MessageStrip>
      )}
    </MessageBox>
  );

  return [DeleteMessageBox, handleResourceDelete];
}

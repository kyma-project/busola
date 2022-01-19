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
import { useProtectedResources, useFeatureToggle } from '.';

export function useDeleteResource({ i18n, resourceType, resourceUrl }) {
  const { t } = useTranslation(['translation'], { i18n });

  const { isProtected, protectedResourceWarning } = useProtectedResources(i18n);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteResourceMutation = useDelete(resourceUrl);
  const [dontConfirmDelete, setDontConfirmDelete] = useFeatureToggle(
    'dontConfirmDelete',
  );
  const withoutQueryString = path => path.split('?')[0];

  const notification = useNotification();

  const prettifiedResourceName = prettifyNameSingular(undefined, resourceType);

  const performDelete = async () => {
    const url = withoutQueryString(resourceUrl);

    LuigiClient.sendCustomMessage({
      id: 'busola.dontConfirmDelete',
      value: dontConfirmDelete,
    });
    try {
      await deleteResourceMutation(url);
      notification.notifySuccess({
        content: t('components.resources-list.messages.delete.success', {
          resourceType: prettifiedResourceName,
        }),
      });
      navigateToList(resourceType);
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

  async function handleResourceDelete(resource) {
    if (dontConfirmDelete) {
      performDelete(resource);
    } else {
      LuigiClient.uxManager().addBackdrop();
      setShowDeleteDialog(true);
    }
  }

  const DeleteMessageBox = ({ resource }) => (
    <MessageBox
      type="warning"
      title={t('common.delete-dialog.title', {
        name: resource?.metadata.name,
      })}
      actions={[
        <Button
          data-testid="delete-confirmation"
          type="negative"
          compact
          onClick={() => performDelete(resource)}
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
          name: resource?.metadata.name,
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

  // const DeleteButton = ({ resource }) => {
  //   const protectedResource = isProtected(resource);
  //   return (
  //     <Button
  //       disabled={protectedResource}
  //       onClick={() => handleResourceDelete(resource)}
  //       option="transparent"
  //       type="negative"
  //     >
  //       {t('common.buttons.delete')}
  //     </Button>
  //   );
  // };

  return [DeleteMessageBox, handleResourceDelete];
}

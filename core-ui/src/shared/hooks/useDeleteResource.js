import { Button, Checkbox, MessageBox, MessageStrip } from 'fundamental-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { navigateToList } from 'shared/hooks/navigate';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteState } from 'state/preferences/dontConfirmDeleteAtom';

export function useDeleteResource({
  resourceTitle,
  resourceType,
  navigateToListAfterDelete = false,
}) {
  const { t } = useTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteResourceMutation = useDelete();
  const [dontConfirmDelete, setDontConfirmDelete] = useRecoilState(
    dontConfirmDeleteState,
  );
  const notification = useNotification();

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const performDelete = async (resource, resourceUrl, deleteFn) => {
    const withoutQueryString = path => path?.split('?')?.[0];
    const url = withoutQueryString(resourceUrl);

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
    setShowDeleteDialog(false);
  };

  const handleResourceDelete = ({ resource, resourceUrl, deleteFn }) => {
    if (dontConfirmDelete) {
      performDelete(resource, resourceUrl, deleteFn);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const DeleteMessageBox = ({
    resource,
    resourceTitle,
    resourceUrl,
    deleteFn,
  }) => (
    <MessageBox
      type="warning"
      title={t('common.delete-dialog.title', {
        name: resourceTitle || resource?.metadata?.name,
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
        <Button onClick={() => setShowDeleteDialog(false)} compact>
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      show={showDeleteDialog}
      onClose={closeDeleteDialog}
    >
      <p>
        {t('common.delete-dialog.message', {
          type: prettifiedResourceName,
          name: resourceTitle || resource?.metadata?.name,
        })}
      </p>
      <div className="fd-margin-top--sm">
        <Checkbox
          checked={dontConfirmDelete}
          onChange={() => setDontConfirmDelete(prevState => !prevState)}
        >
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

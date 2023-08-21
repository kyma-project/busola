import { Button, MessageBox, MessageStrip } from '@ui5/webcomponents-react';
import { Checkbox } from 'fundamental-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteState } from 'state/preferences/dontConfirmDeleteAtom';
import { useUrl } from 'hooks/useUrl';

import { clusterState } from 'state/clusterAtom';

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
  const navigate = useNavigate();
  const { resourceListUrl } = useUrl();
  const cluster = useRecoilValue(clusterState);

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
        if (navigateToListAfterDelete) {
          if (window.location.pathname.includes('busolaextensions')) {
            navigate(`/cluster/${cluster.contextName}/busolaextensions`);
          } else {
            navigate(resourceListUrl(resource, { resourceType }));
          }
        }
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
      type="Warning"
      titleText={t('common.delete-dialog.title', {
        name: resourceTitle || resource?.metadata?.name,
      })}
      open={showDeleteDialog}
      className="ui5-content-density-compact"
      actions={[
        <Button
          data-testid="delete-confirmation"
          design="Negative"
          onClick={() => performDelete(resource, resourceUrl, deleteFn)}
        >
          {t('common.buttons.delete')}
        </Button>,
        <Button
          data-testid="delete-cancel"
          onClick={() => setShowDeleteDialog(false)}
        >
          {t('common.buttons.cancel')}
        </Button>,
      ]}
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
        <MessageStrip
          design="Information"
          hideCloseButton
          className="fd-margin-top--sm"
        >
          {t('common.delete-dialog.information')}
        </MessageStrip>
      )}
    </MessageBox>
  );

  return [DeleteMessageBox, handleResourceDelete];
}

import {
  Button,
  CheckBox,
  FlexBox,
  MessageBox,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteState } from 'state/preferences/dontConfirmDeleteAtom';
import { useUrl } from 'hooks/useUrl';
import { useFeature } from 'hooks/useFeature';

import { clusterState } from 'state/clusterAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';

export function useDeleteResource({
  resourceTitle,
  resourceType,
  navigateToListAfterDelete = false,
  layoutNumber,
  redirectBack = true,
  parentCrdName,
}) {
  const { t } = useTranslation();
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteResourceMutation = useDelete();
  const [dontConfirmDelete, setDontConfirmDelete] = useRecoilState(
    dontConfirmDeleteState,
  );
  const notification = useNotification();
  const navigate = useNavigate();
  const { resourceListUrl } = useUrl();
  const cluster = useRecoilValue(clusterState);
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);

  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const {
    prevLayout,
    prevQuery,
    currentLayout,
    currentQuery,
  } = usePrepareLayout(layoutNumber);

  const performDelete = async (resource, resourceUrl, deleteFn) => {
    const withoutQueryString = path => path?.split('?')?.[0];
    const url = withoutQueryString(resourceUrl);

    const forceRedirect =
      ((layoutColumn.midColumn?.resourceType === resource?.kind ||
        layoutColumn.midColumn?.resourceType === parentCrdName) &&
        layoutColumn.midColumn?.resourceName === resource?.metadata?.name &&
        layoutColumn.midColumn?.namespaceId ===
          resource?.metadata?.namespace) ||
      ((layoutColumn.endColumn?.resourceType === resource?.kind ||
        layoutColumn.endColumn?.resourceType === parentCrdName) &&
        layoutColumn.endColumn?.resourceName === resource?.metadata?.name &&
        layoutColumn.endColumn?.namespaceId === resource?.metadata?.namespace);
    const goToLayout =
      redirectBack || (forceRedirect && layoutNumber !== 'MidColumn')
        ? prevLayout
        : currentLayout;
    const goToLayoutQuery =
      redirectBack || (forceRedirect && layoutNumber !== 'MidColumn')
        ? prevQuery
        : currentQuery;

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

        if (navigateToListAfterDelete || forceRedirect) {
          if (
            window.location.search.includes('layout') &&
            isColumnLeyoutEnabled
          ) {
            if (window.location.pathname.includes('busolaextensions')) {
              navigate(`/cluster/${cluster.contextName}/busolaextensions`);
            } else {
              window.history.pushState(
                window.history.state,
                '',
                `${window.location.pathname.slice(
                  0,
                  window.location.pathname.lastIndexOf('/'),
                )}${goToLayoutQuery}`,
              );
            }

            setLayoutColumn({
              ...layoutColumn,
              layout: goToLayout,
            });
          } else navigate(resourceListUrl(resource, { resourceType }));
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
    resourceIsCluster = false,
    resourceUrl,
    deleteFn,
  }) => (
    <MessageBox
      type="Warning"
      titleText={t(
        resourceIsCluster
          ? 'common.delete-dialog.disconnect-title'
          : 'common.delete-dialog.delete-title',
        {
          type: prettifiedResourceName,
        },
      )}
      open={showDeleteDialog}
      className="ui5-content-density-compact"
      actions={[
        <Button
          key="delete-confirmation"
          data-testid="delete-confirmation"
          design="Emphasized"
          onClick={() => performDelete(resource, resourceUrl, deleteFn)}
        >
          {t(
            resourceIsCluster
              ? 'common.buttons.disconnect'
              : 'common.buttons.delete',
          )}
        </Button>,
        <Button
          key="delete-cancel"
          data-testid="delete-cancel"
          onClick={() => setShowDeleteDialog(false)}
        >
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      onClose={closeDeleteDialog}
    >
      <FlexBox
        direction="Column"
        style={{
          gap: '10px',
          padding: '15px 25px',
        }}
      >
        <Text style={{ paddingLeft: '7.5px' }}>
          {t(
            resourceIsCluster
              ? 'common.delete-dialog.disconnect-message'
              : 'common.delete-dialog.delete-message',
            {
              type: prettifiedResourceName,
              name: resourceTitle || resource?.metadata?.name,
            },
          )}
        </Text>
        <CheckBox
          checked={dontConfirmDelete}
          onChange={() => setDontConfirmDelete(prevState => !prevState)}
          text={t('common.delete-dialog.delete-confirm')}
        />
        {dontConfirmDelete && (
          <MessageStrip design="Information" hideCloseButton>
            {t('common.delete-dialog.information')}
          </MessageStrip>
        )}
      </FlexBox>
    </MessageBox>
  );

  return [DeleteMessageBox, handleResourceDelete];
}

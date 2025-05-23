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
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteState } from 'state/preferences/dontConfirmDeleteAtom';
import { useUrl } from 'hooks/useUrl';

import { clusterState } from 'state/clusterAtom';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';
import './useDeleteResource.scss';

export function useDeleteResource({
  resourceTitle,
  resourceType,
  navigateToListAfterDelete = false,
  layoutNumber,
  redirectBack = true,
  parentCrdName,
  forceConfirmDelete = false,
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
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);

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

  const performCancel = cancelFn => {
    if (cancelFn) {
      cancelFn();
    }
    setShowDeleteDialog(false);
  };
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
      redirectBack || (forceRedirect && layoutNumber !== 'midColumn')
        ? prevLayout
        : currentLayout;
    const goToLayoutQuery =
      redirectBack || (forceRedirect && layoutNumber !== 'midColumn')
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
          if (window.location.search.includes('layout')) {
            if (window.location.pathname.includes('busolaextensions')) {
              navigate(
                `/cluster/${encodeURIComponent(
                  cluster.contextName,
                )}/busolaextensions`,
              );
            } else {
              navigate(
                `${window.location.pathname.slice(
                  0,
                  window.location.pathname.lastIndexOf('/'),
                )}${goToLayoutQuery}`,
              );
            }

            goToLayout === 'TwoColumnsMidExpanded'
              ? setLayoutColumn({
                  ...layoutColumn,
                  endColumn: null,
                  layout: goToLayout,
                })
              : setLayoutColumn({
                  ...layoutColumn,
                  midColumn: null,
                  layout: goToLayout,
                });
          } else {
            if (window.location.pathname.includes('busolaextensions')) {
              navigate(
                `/cluster/${encodeURIComponent(
                  cluster.contextName,
                )}/busolaextensions`,
              );
            } else {
              navigate(resourceListUrl(resource, { resourceType }));
            }
            setLayoutColumn({
              ...layoutColumn,
              midColumn: null,
              endColumn: null,
              layout: 'OneColumn',
            });
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

  const handleResourceDelete = ({ resource, resourceUrl, deleteFn }) => {
    if (dontConfirmDelete && !forceConfirmDelete) {
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
    cancelFn,
    additionalDeleteInfo,
    customDeleteText,
    disableDeleteButton = false,
  }) => {
    return (
      <MessageBox
        style={{ maxWidth: '700px' }}
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
        id="delete-message-box"
        actions={[
          <Button
            key="delete-confirmation"
            data-testid="delete-confirmation"
            design="Emphasized"
            onClick={() => performDelete(resource, resourceUrl, deleteFn)}
            disabled={disableDeleteButton}
          >
            {t(
              resourceIsCluster
                ? 'common.buttons.disconnect'
                : customDeleteText ?? 'common.buttons.delete',
            )}
          </Button>,
          <Button
            key="delete-cancel"
            data-testid="delete-cancel"
            design="Transparent"
            onClick={() => {
              performCancel(cancelFn);
            }}
          >
            {t('common.buttons.cancel')}
          </Button>,
        ]}
        onClose={() => {
          performCancel(cancelFn);
        }}
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
          {additionalDeleteInfo && (
            <Text style={{ paddingLeft: '7.5px' }}>{additionalDeleteInfo}</Text>
          )}
          {!forceConfirmDelete && (
            <CheckBox
              checked={dontConfirmDelete}
              onChange={() => setDontConfirmDelete(prevState => !prevState)}
              text={t('common.delete-dialog.delete-confirm')}
            />
          )}
          {dontConfirmDelete && !forceConfirmDelete && (
            <MessageStrip design="Information" hideCloseButton>
              {t('common.delete-dialog.information')}
            </MessageStrip>
          )}
        </FlexBox>
      </MessageBox>
    );
  };

  return [DeleteMessageBox, handleResourceDelete, showDeleteDialog];
}

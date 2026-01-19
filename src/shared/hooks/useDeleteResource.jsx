import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from 'react-router';

import { useNotification } from 'shared/contexts/NotificationContext';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteAtom } from 'state/settings/dontConfirmDeleteAtom';
import { useUrl } from 'hooks/useUrl';

import { clusterAtom } from 'state/clusterAtom';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';

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
  const dontConfirmDelete = useAtomValue(dontConfirmDeleteAtom);
  const notification = useNotification();
  const navigate = useNavigate();
  const { resourceListUrl } = useUrl();
  const cluster = useAtomValue(clusterAtom);
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);

  const prettifiedResourceName = prettifyNameSingular(
    resourceTitle,
    resourceType,
  );

  const { prevLayout, prevQuery, currentLayout, currentQuery } =
    usePrepareLayout(layoutNumber);

  const performCancel = (cancelFn) => {
    if (cancelFn) {
      cancelFn();
    }
    setShowDeleteDialog(false);
  };
  const performDelete = async (resource, resourceUrl, deleteFn) => {
    const withoutQueryString = (path) => path?.split('?')?.[0];
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

            if (goToLayout === 'TwoColumnsMidExpanded') {
              setLayoutColumn({
                ...layoutColumn,
                endColumn: null,
                layout: goToLayout,
              });
            } else {
              setLayoutColumn({
                ...layoutColumn,
                midColumn: null,
                layout: goToLayout,
              });
            }
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

  return {
    handleResourceDelete,
    showDeleteDialog,
    performDelete,
    performCancel,
  };
}

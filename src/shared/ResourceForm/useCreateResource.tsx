import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';

import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { createPatch } from 'rfc6902';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { Button, List, ListItemStandard } from '@ui5/webcomponents-react';
import { ForceUpdateModalContent } from './ForceUpdateModalContent';
import { useUrl } from 'hooks/useUrl';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { useNavigate } from 'react-router';
import { FormEvent, useMemo } from 'react';
import type FCLLayout from '@ui5/webcomponents-fiori/dist/types/FCLLayout';

export type SkinCreateFn = () => boolean;

export type useCreateResourcesProps = {
  singularName: string;
  pluralKind: string;
  resource: any;
  initialResource?: any;
  updateInitialResource?: React.SetStateAction<any>;
  createUrl?: string;
  skipCreateFn?: SkinCreateFn;
  afterCreatedFn?: (defaultAfterCreatedFn: () => void) => void;
  urlPath?: string;
  layoutNumber?: string;
  resetLayout?: boolean;
  afterCreatedCustomMessage?: string;
};

function createErrorContent(
  t: Function,
  error: any,
  isEdit: boolean,
  singularName: string,
): React.ReactNode {
  if (error instanceof HttpError) {
    console.log(error.errorDetails);
    const causes = error.errorDetails.causes;
    return (
      <List
        headerText={t(
          isEdit
            ? 'common.create-form.messages.patch-failure'
            : 'common.create-form.messages.create-failure',
          {
            resourceType: singularName,
            error: '',
          },
        )}
      >
        {causes.map((cause: any) => (
          <>
            <p>Type: {cause.reason}</p>
            <p>Cause: {cause.message}</p>
            <p>Affected Field: {cause.field}</p>
            <ListItemStandard />
          </>
        ))}
      </List>
    );
  } else {
    return t(
      isEdit
        ? 'common.create-form.messages.patch-failure'
        : 'common.create-form.messages.create-failure',
      {
        resourceType: singularName,
        error: error.message,
      },
    );
  }
}

export type CreateResourceFn = (e?: FormEvent) => void;
export function useCreateResource({
  singularName,
  pluralKind,
  resource,
  initialResource,
  updateInitialResource,
  createUrl = '',
  skipCreateFn,
  afterCreatedFn,
  urlPath,
  layoutNumber,
  resetLayout,
  afterCreatedCustomMessage,
}: useCreateResourcesProps): CreateResourceFn {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const getRequest = useSingleGet();
  const postRequest = usePost();
  const patchRequest = useUpdate();
  const { scopedUrl } = useUrl();
  const [layoutColumn, setLayoutColumn] = useAtom(columnLayoutAtom);
  const activeNamespace = useAtomValue(activeNamespaceIdAtom);

  const { nextQuery, nextLayout } = usePrepareLayout(layoutNumber);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.uid && !layoutColumn?.showCreate?.resource,
    [initialResource, layoutColumn?.showCreate?.resource],
  );

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content:
        afterCreatedCustomMessage ??
        t(
          isEdit
            ? 'common.create-form.messages.patch-success'
            : 'common.create-form.messages.create-success',
          {
            resourceType: singularName,
          },
        ),
    });
    updateInitialResource(resource);

    if (!isEdit || resetLayout) {
      if (resetLayout) {
        setLayoutColumn({
          ...layoutColumn,
          layout: 'OneColumn',
          midColumn: null,
          endColumn: null,
          showCreate: null,
        });
        navigate(window.location.pathname, { replace: true });
      } else {
        const { group, version } = extractApiGroupVersion(resource?.apiVersion);
        setLayoutColumn(
          nextLayout === 'TwoColumnsMidExpanded'
            ? {
                ...layoutColumn,
                layout: nextLayout as FCLLayout,
                showCreate: null,
                showEdit: null,
                midColumn: {
                  resourceName: resource.metadata.name,
                  resourceType: resource.kind,
                  rawResourceTypeName: resource.kind,
                  namespaceId: resource.metadata.namespace ?? activeNamespace,
                  apiGroup: group,
                  apiVersion: version,
                },
                endColumn: null,
              }
            : {
                ...layoutColumn,
                layout: nextLayout as FCLLayout,
                showCreate: null,
                showEdit: null,
                endColumn: {
                  resourceName: resource.metadata.name,
                  resourceType: resource.kind,
                  rawResourceTypeName: resource.kind,
                  namespaceId: resource.metadata.namespace ?? activeNamespace,
                },
              },
        );
        const link = `${scopedUrl(
          `${urlPath || pluralKind.toLowerCase()}/${encodeURIComponent(
            resource.metadata.name,
          )}`,
        )}${nextQuery}`;
        navigate(link);
      }
    }
  };

  const showError = (error: any) => {
    console.error(error);
    const errorContent = createErrorContent(t, error, isEdit, singularName);
    const previousActiveElement = document.activeElement;
    notification.notifyError({
      actions: (close, defaultCloseButton) => {
        const closeWrapper = () => {
          close();
          (previousActiveElement as HTMLElement)?.focus();
        };
        return defaultCloseButton(closeWrapper);
      },
      content: errorContent,
    });
  };

  const onSuccess = () => {
    if (afterCreatedFn) {
      afterCreatedFn(defaultAfterCreatedFn);
    } else {
      defaultAfterCreatedFn();
    }
  };

  const handleCreate = async () => {
    try {
      if (isEdit) {
        const newResource = { ...resource };
        if (
          initialResource?.metadata?.resourceVersion &&
          !newResource?.metadata?.resourceVersion
        ) {
          newResource.metadata.resourceVersion =
            initialResource.metadata.resourceVersion;
        }
        const diff = createPatch(initialResource, newResource);
        await patchRequest(createUrl, diff);
      } else {
        await postRequest(createUrl, resource);
      }

      onSuccess();
    } catch (e) {
      const isConflict = e instanceof HttpError && e.code === 409;
      if (isConflict && isEdit) {
        const response = await getRequest(createUrl);
        const updatedResource = await response.json();

        const makeForceUpdateFn = (closeModal: () => void) => {
          return async () => {
            resource.metadata.resourceVersion =
              initialResource?.metadata.resourceVersion;
            try {
              await patchRequest(
                createUrl,
                createPatch(initialResource, resource),
              );
              closeModal();
              onSuccess();
            } catch (e) {
              showError(e);
            }
          };
        };

        notification.notifyError({
          content: (
            <ForceUpdateModalContent
              error={e}
              singularName={singularName}
              initialResource={updatedResource}
              modifiedResource={resource}
            />
          ),
          actions: (closeModal, defaultCloseButton) => [
            <Button key="force-update" onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        console.log(e, '_----');
        showError(e);
        return false;
      }
    }
  };

  return async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (skipCreateFn && skipCreateFn()) {
      return null;
    } else handleCreate();
  };
}

import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { createPatch } from 'rfc6902';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { Button } from '@ui5/webcomponents-react';
import { ForceUpdateModalContent } from './ForceUpdateModalContent';
import { useUrl } from 'hooks/useUrl';
import { usePrepareLayout } from 'shared/hooks/usePrepareLayout';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useFeature } from 'hooks/useFeature';
import { isResourceEditedState } from 'state/resourceEditedAtom';

export function useCreateResource({
  singularName,
  pluralKind,
  resource,
  initialResource,
  initialUnchangedResource,
  createUrl,
  afterCreatedFn,
  urlPath,
  layoutNumber,
  resetLayout,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const getRequest = useSingleGet();
  const postRequest = usePost();
  const patchRequest = useUpdate();
  const { scopedUrl } = useUrl();
  const navigate = useNavigate();
  const [layoutColumn, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );

  const { nextQuery, nextLayout } = usePrepareLayout(layoutNumber);

  const isEdit = !!initialUnchangedResource?.metadata?.name;

  const defaultAfterCreatedFn = () => {
    notification.notifySuccess({
      content: t(
        isEdit
          ? 'common.create-form.messages.patch-success'
          : 'common.create-form.messages.create-success',
        {
          resourceType: singularName,
        },
      ),
    });

    if (!isEdit || resetLayout) {
      if (isColumnLeyoutEnabled) {
        if (resetLayout) {
          setLayoutColumn({
            layout: 'OneColumn',
            midColumn: null,
            endColumn: null,
            showCreate: null,
          });
        } else {
          setLayoutColumn(
            nextLayout === 'TwoColumnsMidExpanded'
              ? {
                  layout: nextLayout,
                  showCreate: null,
                  midColumn: {
                    resourceName: resource.metadata.name,
                    resourceType: resource.kind,
                    namespaceId: resource.metadata.namespace,
                  },
                  endColumn: null,
                }
              : {
                  ...layoutColumn,
                  layout: nextLayout,
                  showCreate: null,
                  endColumn: {
                    resourceName: resource.metadata.name,
                    resourceType: resource.kind,
                    namespaceId: resource.metadata.namespace,
                  },
                },
          );
          window.history.pushState(
            window.history.state,
            '',
            `${scopedUrl(
              `${urlPath || pluralKind.toLowerCase()}/${encodeURIComponent(
                resource.metadata.name,
              )}`,
            )}${nextQuery}`,
          );
        }
      } else {
        navigate(
          `${scopedUrl(
            `${urlPath || pluralKind.toLowerCase()}/${encodeURIComponent(
              resource.metadata.name,
            )}`,
          )}`,
        );
      }
    }
  };

  const showError = error => {
    console.error(error);
    notification.notifyError({
      content: t(
        isEdit
          ? 'common.create-form.messages.patch-failure'
          : 'common.create-form.messages.create-failure',
        {
          resourceType: singularName,
          error: error.message,
        },
      ),
    });
  };

  const onSuccess = () => {
    if (afterCreatedFn) {
      afterCreatedFn(defaultAfterCreatedFn);
    } else {
      defaultAfterCreatedFn();
    }
    console.log('onSuccess');
    setIsResourceEdited({
      ...isResourceEdited,
      isEdited: false,
      isSaved: true,
    });
  };

  return async e => {
    if (e) {
      e.preventDefault();
    }

    try {
      if (isEdit) {
        const diff = createPatch(initialUnchangedResource, resource);
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

        const makeForceUpdateFn = closeModal => {
          return async () => {
            resource.metadata.resourceVersion =
              initialUnchangedResource?.metadata.resourceVersion;
            try {
              await patchRequest(
                createUrl,
                createPatch(initialUnchangedResource, resource),
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
            <Button onClick={makeForceUpdateFn(closeModal)}>
              {t('common.create-form.force-update')}
            </Button>,
            defaultCloseButton(closeModal),
          ],
          wider: true,
        });
      } else {
        showError(e);
        return false;
      }
    }
  };
}

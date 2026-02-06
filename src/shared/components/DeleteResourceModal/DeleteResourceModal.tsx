import {
  Button,
  CheckBox,
  FlexBox,
  MessageBox,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';

import { prettifyNameSingular } from 'shared/utils/helpers';
import { dontConfirmDeleteAtom } from 'state/settings/dontConfirmDeleteAtom';
import { ReactNode } from 'react';

interface DeleteResourceModalProps {
  resourceTitle?: string;
  resourceType?: string;
  forceConfirmDelete?: boolean;
  resource?: any;
  resourceIsCluster?: boolean;
  resourceUrl?: string;
  customTitle?: string;
  customMessage?: string;
  deleteFn?: (resource: any, resourceUrl: string) => Promise<void>;
  cancelFn?: () => void;
  additionalDeleteInfo?: ReactNode;
  customDeleteText?: string | null;
  disableDeleteButton?: boolean;
  performDelete: (resource: any, resourceUrl: any, deleteFn: any) => void;
  showDeleteDialog: boolean;
  performCancel: (cancelFn?: () => void) => void;
  additionalPadding?: boolean;
}

export function DeleteResourceModal({
  resourceTitle,
  resourceType,
  forceConfirmDelete = false,
  resource,
  resourceIsCluster = false,
  resourceUrl,
  customTitle,
  customMessage,
  deleteFn,
  cancelFn,
  additionalDeleteInfo,
  customDeleteText,
  disableDeleteButton = false,
  performDelete,
  showDeleteDialog,
  performCancel,
  additionalPadding = false,
}: DeleteResourceModalProps) {
  const prettifiedResourceName = prettifyNameSingular(undefined, resourceType);
  const { t } = useTranslation();
  const defaultTitle = t(
    resourceIsCluster
      ? 'common.delete-dialog.disconnect-title'
      : 'common.delete-dialog.delete-title',
    {
      type: prettifiedResourceName,
    },
  );
  const [dontConfirmDelete, setDontConfirmDelete] = useAtom(
    dontConfirmDeleteAtom,
  );

  return (
    <MessageBox
      style={{ maxWidth: '700px' }}
      type="Warning"
      titleText={customTitle || defaultTitle}
      open={showDeleteDialog}
      className="ui5-content-density-compact"
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
              : (customDeleteText ?? 'common.buttons.delete'),
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
          paddingLeft: additionalPadding ? '1rem' : undefined,
          paddingRight: additionalPadding ? '1rem' : undefined,
        }}
      >
        <Text style={{ paddingLeft: '0.5rem', whiteSpace: 'pre-line' }}>
          {customMessage ??
            t(
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
          <Text style={{ paddingLeft: '0.5rem' }}>{additionalDeleteInfo}</Text>
        )}
        {!forceConfirmDelete && (
          <CheckBox
            accessibleName={t('common.delete-dialog.delete-confirm')}
            checked={dontConfirmDelete}
            onChange={() => setDontConfirmDelete((prevState) => !prevState)}
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
}

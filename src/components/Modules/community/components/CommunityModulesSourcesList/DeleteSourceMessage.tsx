import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FlexBox,
  FlexBoxDirection,
  Link,
  List,
  ListItemStandard,
  MessageBox,
  Text,
} from '@ui5/webcomponents-react';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { Resource } from 'components/Extensibility/contexts/DataSources';
import { getResourcePath } from 'components/Modules/support';
import { deleteResources } from 'components/Modules/deleteModulesHelpers';
import { useNotification } from 'shared/contexts/NotificationContext';
import { Spinner } from 'shared/components/Spinner/Spinner';

export const DeleteSourceMessage = ({
  sourceToDelete,
  notInstalledModuleTemplates,
  onCancel,
}: {
  sourceToDelete: string;
  notInstalledModuleTemplates: { items: Resource[] };
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const deleteFn = useDelete();
  const notification = useNotification();
  const [deleteSourceLoader, setDeleteSourceLoader] = useState(false);

  const templatesToDelete = notInstalledModuleTemplates?.items?.filter(
    (item: Resource) => item?.metadata?.annotations?.source === sourceToDelete,
  );
  const deleteSource = async () => {
    if (!templatesToDelete?.length) {
      return;
    }
    setDeleteSourceLoader(true);
    const urls = templatesToDelete.map((template: Resource) => {
      return getResourcePath(template);
    });
    try {
      await deleteResources(deleteFn, urls);
    } catch (e) {
      notification.notifyError({
        content: t('modules.community.messages.delete-template-failure', {
          error: e instanceof Error && e?.message ? e.message : '',
        }),
      });
    }
    setDeleteSourceLoader(false);
    onCancel();
  };

  return (
    <MessageBox
      open={true}
      titleText={t('modules.community.source-yaml.remove-source-yaml')}
      actions={[
        deleteSourceLoader ? <Spinner key="delete-source-loader" /> : null,
        <Button
          accessibleName="remove-source"
          disabled={deleteSourceLoader}
          design="Emphasized"
          key="remove-source"
          onClick={deleteSource}
        >
          {t('common.buttons.remove')}
        </Button>,
        <Button
          accessibleName="cancel-remove-source"
          design="Transparent"
          key="cancel-remove-source"
          onClick={onCancel}
        >
          {t('common.buttons.cancel')}
        </Button>,
      ]}
    >
      <FlexBox
        direction={FlexBoxDirection.Column}
        gap={'0.5rem'}
        className="sap-margin-top-small"
      >
        <List
          separators="None"
          header={
            <div className="delete-source-message-box-header">
              <Text>
                {`${t('modules.community.source-yaml.remove-source-yaml')}`}{' '}
                <Link href={sourceToDelete} target="_blank">
                  {sourceToDelete}
                </Link>
                ?
              </Text>
              <Text>
                {`${t('modules.community.source-yaml.remove-source-yaml-desc')}:`}
              </Text>
            </div>
          }
        >
          {templatesToDelete?.map((template: Resource, index: number) => (
            <ListItemStandard
              key={`${index}-${template?.metadata?.name}`}
              type="Inactive"
            >
              <li className="message-list-item">{template?.metadata?.name}</li>
            </ListItemStandard>
          ))}
        </List>
      </FlexBox>
    </MessageBox>
  );
};

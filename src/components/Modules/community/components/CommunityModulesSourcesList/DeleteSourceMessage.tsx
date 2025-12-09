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
import { Resource } from 'components/Extensibility/contexts/DataSources';

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
  const templatesToDelete = notInstalledModuleTemplates.items.filter(
    (item: Resource) => item?.metadata?.annotations?.source === sourceToDelete,
  );
  return (
    <MessageBox
      open={true}
      titleText={t('modules.community.source-yaml.remove-source-yaml')}
      actions={[
        <Button
          accessibleName="remove-source"
          design="Emphasized"
          key="remove-source"
          onClick={() => {}}
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
                <Link design="Default" href={sourceToDelete} target="_blank">
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
          {templatesToDelete.map((template: Resource, index: number) => (
            <ListItemStandard key={`${index}-${template?.metadata?.name}`}>
              <li className="message-list-item">{template?.metadata?.name}</li>
            </ListItemStandard>
          ))}
        </List>
      </FlexBox>
    </MessageBox>
  );
};

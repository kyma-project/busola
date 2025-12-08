import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FlexBox,
  FlexBoxDirection,
  List,
  ListItemStandard,
  MessageBox,
  Text,
} from '@ui5/webcomponents-react';

export const DeleteSourceMessage = ({
  sourceToDelete,
  notInstalledModuleTemplates,
  onCancel,
}: {
  sourceToDelete: string;
  notInstalledModuleTemplates: any;
  onCancel: Dispatch<SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  const templatesToDelete = notInstalledModuleTemplates.items.filter(
    (item: any) => item?.metadata?.annotations?.source === sourceToDelete,
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
          onClick={() => onCancel('')}
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
            <>
              <Text>{`${t('modules.community.source-yaml.remove-source-yaml')} ${sourceToDelete}?`}</Text>
              <Text>
                {`${t('modules.community.source-yaml.remove-source-yaml-desc')}:`}
              </Text>
            </>
          }
        >
          {templatesToDelete.map((template: any, index: number) => (
            <ListItemStandard key={`${index}-${template?.metadata?.name}`}>
              <Text>{template?.metadata?.name}</Text>
            </ListItemStandard>
          ))}
          {/* TODO: Remove hardcoded items after testing: */}
          <ListItemStandard>
            <Text>{'docker-registry-0.9.0 '}</Text>
          </ListItemStandard>
          <ListItemStandard>
            <Text>{'cap-operator-0.15.0'}</Text>
          </ListItemStandard>
        </List>
      </FlexBox>
    </MessageBox>
  );
};

import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  FlexBox,
  FlexBoxDirection,
  Link,
  List,
  ListItemStandard,
  MessageBox,
  Text,
  Title,
} from '@ui5/webcomponents-react';
import 'components/Modules/community/components/CommunityModulesSourcesList.scss';
import { AddSourceYamls } from './AddSourceYamls';
import { useContext, useState } from 'react';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { HintButton } from 'shared/components/HintButton/HintButton';
import { CommunityModuleContext } from '../providers/CommunityModuleProvider';
import { createPortal } from 'react-dom';

export const CommunityModulesSourcesList = () => {
  const { t } = useTranslation();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const { notInstalledCommunityModuleTemplates } = useContext(
    CommunityModuleContext,
  );

  const [showTitleDescription, setShowTitleDescription] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState('');

  const getSources = () => {
    const sources = (communityModuleTemplates?.items ?? [])
      .map((item: any) => {
        return item?.metadata?.annotations?.source;
      })
      .filter(Boolean);
    return [...new Set(sources)];
  };

  return (
    <Card
      className="sap-margin-top-small"
      accessibleName={t('modules.community.source-yaml.source-yamls-header')}
      header={
        <div className="card-header">
          <div className="card-header__title">
            <Title level="H5">
              {t('modules.community.source-yaml.source-yamls-header')}
            </Title>
            <HintButton
              className="sap-margin-begin-tiny"
              setShowTitleDescription={setShowTitleDescription}
              description={t(
                'modules.community.source-yaml.add-source-yaml-info',
              )}
              showTitleDescription={showTitleDescription}
              ariaTitle={t('modules.community.source-yaml.source-yamls-header')}
            />
          </div>
          <AddSourceYamls />
        </div>
      }
    >
      <List
        onItemDelete={(e) => setSourceToDelete(e.detail.item.textContent)}
        selectionMode="Delete"
        separators="Inner"
        className="list-top-separator"
      >
        {moduleTemplatesLoading ? (
          <Spinner />
        ) : (
          <ListElements sources={getSources()} />
        )}
      </List>
      {sourceToDelete &&
        createPortal(
          <DeleteMessage
            sourceToDelete={sourceToDelete}
            notInstalledModuleTemplates={notInstalledCommunityModuleTemplates}
          />,
          document.body,
        )}
    </Card>
  );
};

const ListElements = ({ sources }: { sources: string[] }) => {
  const { t } = useTranslation();

  if (!sources.length) {
    return (
      <ListItemStandard
        text={t('modules.community.source-yaml.no-source-yaml')}
      />
    );
  }
  return (
    <>
      {sources.map((sourceYaml, ind) => (
        <ListItemStandard key={`${ind}-${sourceYaml}`}>
          <Link design="Default" href={sourceYaml} target="_blank">
            {sourceYaml}
          </Link>
        </ListItemStandard>
      ))}
    </>
  );
};

const DeleteMessage = ({
  sourceToDelete,
  notInstalledModuleTemplates,
}: {
  sourceToDelete: string;
  notInstalledModuleTemplates: any;
}) => {
  const { t } = useTranslation();
  const templatesToDelete = notInstalledModuleTemplates.items.filter(
    (item: any) => item?.metadata?.annotations?.source === sourceToDelete,
  );
  return (
    <MessageBox
      open={true}
      className="sourceurl-messagebox"
      titleText={'Remove Source YAML'}
      actions={[
        <Button
          accessibleName="add-yamls"
          design="Emphasized"
          key="add-yamls"
          onClick={() => {}}
        >
          {'Remove'}
        </Button>,
        <Button
          accessibleName="cancel-add-yamls"
          design="Transparent"
          key="cancel-add-yamls"
          onClick={() => {}}
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
              <Text className="to-add-list-header">
                {`Remove source YAML ${sourceToDelete}?`}
              </Text>
              <Text className="to-add-list-header">
                {
                  "Your previously installed modules will remain available, but you won't be able to add any of the following:"
                }
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

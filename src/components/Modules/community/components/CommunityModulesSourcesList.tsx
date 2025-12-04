import { useTranslation } from 'react-i18next';
import {
  Card,
  Link,
  List,
  ListItemStandard,
  Title,
} from '@ui5/webcomponents-react';
import 'components/Modules/community/components/CommunityModulesSourcesList.scss';
import { AddSourceYamls } from './AddSourceYamls';
import { useContext, useState } from 'react';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { HintButton } from 'shared/components/HintButton/HintButton';

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

export const CommunityModulesSourcesList = () => {
  const { t } = useTranslation();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const [showTitleDescription, setShowTitleDescription] = useState(false);

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
        // TODO: Delete will be implemented in the next task.
        onItemDelete={(e) => console.log('DELETE', e)}
        selectionMode="None" // change to => 'Delete' once deleting is implemented
        separators="Inner"
        className="list-top-separator"
      >
        {moduleTemplatesLoading ? (
          <Spinner />
        ) : (
          <ListElements sources={getSources()} />
        )}
      </List>
    </Card>
  );
};

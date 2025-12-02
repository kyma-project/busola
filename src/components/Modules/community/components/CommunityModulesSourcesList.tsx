import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  List,
  ListItemStandard,
} from '@ui5/webcomponents-react';
import 'components/Modules/community/components/CommunityModulesSourcesList.scss';
import { AddSourceYamls } from './AddSourceYamls';
import { useContext } from 'react';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';

export const CommunityModulesSourcesList = () => {
  const { t } = useTranslation();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const getSources = () => {
    const sources = communityModuleTemplates?.items
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
        <CardHeader
          titleText={t('modules.community.source-yaml.source-yamls-header')}
          action={<AddSourceYamls />}
        />
      }
    >
      <List
        // TODO: Deleting is not ready.
        onItemDelete={(e) => console.log('TEST', e)}
        selectionMode="Delete"
        separators="Inner"
        className="list-top-separator"
      >
        {getSources().map((sourceYaml, ind) => (
          <ListItemStandard key={`${ind}-${sourceYaml}`} text={sourceYaml} />
        ))}
      </List>
    </Card>
  );
};

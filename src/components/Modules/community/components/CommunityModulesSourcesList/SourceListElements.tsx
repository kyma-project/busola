import { useTranslation } from 'react-i18next';
import { Link, ListItemStandard } from '@ui5/webcomponents-react';
import { Resource } from 'components/Extensibility/contexts/DataSources';

export const SourceListElements = ({
  sources,
  notInstalledModuleTemplates,
}: {
  sources: string[];
  notInstalledModuleTemplates: { items: Resource[] };
}) => {
  const { t } = useTranslation();
  const getSourceTemplates = (sourceYaml: string) => {
    return notInstalledModuleTemplates?.items?.filter(
      (item: Resource) => item?.metadata?.annotations?.source === sourceYaml,
    );
  };

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
        <ListItemStandard
          key={`${ind}-${sourceYaml}`}
          deleteButton={
            // If there are no templates, the delete button will not be visible.
            getSourceTemplates(sourceYaml)?.length ? null : (
              <span style={{ display: 'none' }} slot="deleteButton"></span>
            )
          }
        >
          <Link href={sourceYaml} target="_blank">
            {sourceYaml}
          </Link>
        </ListItemStandard>
      ))}
    </>
  );
};

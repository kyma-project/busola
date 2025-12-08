import { useTranslation } from 'react-i18next';
import { Link, ListItemStandard } from '@ui5/webcomponents-react';

export const SourceListElements = ({ sources }: { sources: string[] }) => {
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

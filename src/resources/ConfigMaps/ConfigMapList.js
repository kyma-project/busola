import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import { ConfigMapCreate } from './ConfigMapCreate';

export function ConfigMapList(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="config-maps.description">
      <ExternalLink
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/configuration/configmap/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={ConfigMapCreate}
      emptyListProps={{
        subtitleText: t('config-maps.description'),
        url: 'https://kubernetes.io/docs/concepts/configuration/configmap/',
      }}
    />
  );
}
export default ConfigMapList;

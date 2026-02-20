import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { useUrl } from 'hooks/useUrl';

import BusolaExtensionCreate from './BusolaExtensionCreate';

function BusolaExtensionList({
  layoutCloseCreateUrl,
}: {
  layoutCloseCreateUrl: string;
}) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const customColumns = [
    {
      header: t('common.headers.namespace'),
      value: (resource: { metadata: { namespace: string } }) =>
        resource.metadata.namespace,
    },
  ];

  const description = (
    <Trans i18nKey="extensibility.description">
      <ExternalLink url="https://github.com/kyma-project/busola/tree/main/docs/extensibility" />
    </Trans>
  );

  return (
    /*@ts-expect-error Type mismatch between js and ts*/
    <ResourcesList
      searchSettings={{
        textSearchProperties: ['metadata.namespace'],
      }}
      enableColumnLayout={true}
      customColumns={customColumns}
      description={description}
      createResourceForm={BusolaExtensionCreate}
      resourceType={t('extensibility.title')}
      resourceUrl="/api/v1/configmaps?labelSelector=busola.io/extension=resource"
      resourceUrlPrefix="/api/v1"
      hasDetailsView={true}
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      customUrl={(extension: {
        metadata: { namespace: string; name: string };
      }) =>
        clusterUrl(
          `busolaextensions/${extension.metadata.namespace}/${extension.metadata.name}`,
        )
      }
      emptyListProps={{
        subtitleText: t('extensibility.description'),
        url: 'https://github.com/kyma-project/busola/tree/main/docs/extensibility',
      }}
    />
  );
}
export default BusolaExtensionList;

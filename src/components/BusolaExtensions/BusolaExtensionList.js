import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { useUrl } from 'hooks/useUrl';

import BusolaExtensionCreate from './BusolaExtensionCreate';

export function BusolaPluginList({ enableColumnLayout, layoutCloseCreateUrl }) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const customColumns = [
    {
      header: t('common.headers.namespace'),
      value: resource => resource.metadata.namespace,
    },
  ];

  const description = (
    <Trans i18nKey="extensibility.description">
      <Link
        className="bsl-link"
        url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
      />
    </Trans>
  );

  return (
    <ResourcesList
      searchSettings={{
        textSearchProperties: ['metadata.namespace'],
      }}
      enableColumnLayout={enableColumnLayout}
      customColumns={customColumns}
      description={description}
      createResourceForm={BusolaExtensionCreate}
      resourceType={t('extensibility.title')}
      resourceUrl="/api/v1/configmaps?labelSelector=busola.io/extension=resource"
      resourceUrlPrefix="/api/v1"
      hasDetailsView={true}
      layoutCloseCreateUrl={layoutCloseCreateUrl}
      customUrl={extension =>
        clusterUrl(
          `busolaextensions/${extension.metadata.namespace}/${extension.metadata.name}`,
        )
      }
      emptyListProps={{
        subtitleText: t('extensibility.description'),
        url:
          'https://github.com/kyma-project/busola/tree/main/docs/extensibility',
      }}
    />
  );
}
export default BusolaPluginList;

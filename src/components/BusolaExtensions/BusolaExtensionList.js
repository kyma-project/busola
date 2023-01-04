import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { useUrl } from 'hooks/useUrl';

import { BusolaExtensionCreate } from './BusolaExtensionCreate';

export function BusolaPluginList(props) {
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
        className="fd-link"
        url="https://github.com/kyma-project/busola/tree/main/docs/extensibility"
      />
    </Trans>
  );

  return (
    <ResourcesList
      searchSettings={{
        textSearchProperties: ['metadata.namespace'],
      }}
      customColumns={customColumns}
      description={description}
      createResourceForm={BusolaExtensionCreate}
      resourceType={t('extensibility.title')}
      resourceUrl="/api/v1/configmaps?labelSelector=busola.io/extension=resource"
      resourceUrlPrefix="/api/v1"
      hasDetailsView={true}
      customUrl={extension =>
        clusterUrl(
          `busolaextensions/${extension.metadata.namespace}/${extension.metadata.name}`,
        )
      }
    />
  );
}
export default BusolaPluginList;

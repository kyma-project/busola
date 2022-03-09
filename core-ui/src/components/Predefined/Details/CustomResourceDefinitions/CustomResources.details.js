import React from 'react';
import * as jp from 'jsonpath';

import {
  ResourceDetails,
  useGet,
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
  Spinner,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

export function CustomResource({ params }) {
  const { t, i18n } = useTranslation();

  const { namespaceId: namespace } = useMicrofrontendContext();
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  } = params;
  const { data, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
    },
  );

  if (loading) return <Spinner />;

  const versions = data?.spec?.versions;
  const version = versions?.find(version => version.name === resourceVersion);
  const AdditionalPrinterColumns = resource => {
    const getJsonPath = (resource, jsonPath) => {
      const value =
        jp.value(resource, jsonPath.substring(1)) || EMPTY_TEXT_PLACEHOLDER;
      return typeof value === 'boolean' ? value.toString() : value;
    };

    const headerRenderer = () => [
      t('common.headers.name'),
      t('custom-resource-definitions.headers.description'),
      t('custom-resource-definitions.headers.value'),
    ];
    const rowRenderer = entry => [
      entry.name,
      entry.description || EMPTY_TEXT_PLACEHOLDER,
      getJsonPath(resource, entry.jsonPath),
    ];

    return (
      <GenericList
        title={t('custom-resource-definitions.subtitle.additional-columns')}
        entries={version?.additionalPrinterColumns || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="cr-additional-printer-columns"
        i18n={i18n}
      />
    );
  };

  const crdName = customResourceDefinitionName.split('.')[0];
  const crdGroup = customResourceDefinitionName.replace(`${crdName}.`, '');
  const resourceUrl = `/apis/${crdGroup}/${resourceVersion}/${
    namespace ? `namespaces/${namespace}/` : ''
  }${crdName}/${resourceName}`;

  const breadcrumbs = [
    {
      name: 'CustomResourceDefinitions',
      path: '/',
      fromContext: 'customresourcedefinitions',
    },
    {
      name: customResourceDefinitionName,
      path: '/',
      fromContext: 'customresourcedefinition',
    },
    { name: '' },
  ];

  return (
    <ResourceDetails
      resourceUrl={resourceUrl}
      resourceType={crdName}
      resourceName={resourceName}
      namespace={namespace}
      breadcrumbs={breadcrumbs}
      customComponents={[AdditionalPrinterColumns]}
      i18n={i18n}
    />
  );
}

import React from 'react';
import LuigiClient from '@luigi-project/client';

import {
  ResourceDetails,
  useGet,
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
} from 'react-shared';

export function CustomResource({ params }) {
  const namespace = LuigiClient.getContext().namespaceId;
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  } = params;
  const { data, error, loading } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${customResourceDefinitionName}`,
    {
      pollingInterval: null,
    },
  );

  if (loading) return 'loading'; //change!

  const versions = data?.spec?.versions;
  const version = versions?.find(version => version.name === resourceVersion);

  const AdditionalPrinterColumns = resource => {
    if (!version.additionalPrinterColumns) return null;

    const getJsonPath = (resource, jsonPath) => {
      return (
        jsonPath
          ?.substring(1)
          .split('.')
          .reduce((obj, i) => obj[i], resource) || EMPTY_TEXT_PLACEHOLDER
      );
    };
    const headerRenderer = () => ['Name', 'Value'];
    const rowRenderer = entry => [
      entry.name,
      getJsonPath(resource, entry.jsonPath),
    ];

    return (
      <GenericList
        title="Additional Printer Columns"
        entries={version.additionalPrinterColumns || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
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
    />
  );
}

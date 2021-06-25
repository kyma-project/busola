import React from 'react';
import LuigiClient from '@luigi-project/client';
import * as jp from 'jsonpath';

import {
  ResourceDetails,
  useGet,
  EMPTY_TEXT_PLACEHOLDER,
  GenericList,
  Spinner,
} from 'react-shared';

export function CustomResource({ params }) {
  const namespace = LuigiClient.getContext().namespaceId;
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

    const headerRenderer = () => ['Name', 'Description', 'Value'];
    const rowRenderer = entry => [
      entry.name,
      entry.description || EMPTY_TEXT_PLACEHOLDER,
      getJsonPath(resource, entry.jsonPath),
    ];

    return (
      <GenericList
        title="Additional Printer Columns"
        entries={version?.additionalPrinterColumns || []}
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

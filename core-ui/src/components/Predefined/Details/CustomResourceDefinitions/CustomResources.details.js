import React from 'react';
import LuigiClient from '@luigi-project/client';

import { ResourceDetails } from 'react-shared';

export function CustomResource({ params }) {
  const namespace = LuigiClient.getContext().namespaceId;
  const {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  } = params;
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
    />
  );
}

import React from 'react';
import { NamespaceStatus } from '../Details/Namespace/NamespaceStatus';
import LuigiClient from '@luigi-project/client';
import { useShowSystemNamespaces } from 'react-shared';

const FilterNamespaces = namespace => {
  const showSystemNamespaces = useShowSystemNamespaces();
  const systemNamespaces = LuigiClient.getContext().systemNamespaces;

  return showSystemNamespaces
    ? true
    : !systemNamespaces.includes(namespace.metadata.name);
};

export const NamespacesList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: namespace => (
        <NamespaceStatus namespaceStatus={namespace.status} />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      filter={FilterNamespaces}
      {...otherParams}
    />
  );
};

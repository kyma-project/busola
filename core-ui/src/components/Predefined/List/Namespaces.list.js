import React from 'react';
import { NamespaceStatus } from '../Details/Namespace/NamespaceStatus';
import LuigiClient from '@luigi-project/client';
import { getFeatureToggle } from 'react-shared';

const FilterNamespaces = namespace => {
  const showHiddenNamespaces = getFeatureToggle('showHiddenNamespaces');
  const hiddenNamespaces = LuigiClient.getContext().hiddenNamespaces;

  return showHiddenNamespaces
    ? true
    : !hiddenNamespaces.includes(namespace.metadata.name);
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

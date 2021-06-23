import React from 'react';
import { CustomResources } from './CustomResources.list';

import { GenericList } from 'react-shared';

export const CustomResourceDefinitionsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const customColumns = [
    {
      header: 'Scope',
      value: resource => resource.spec.scope,
    },
  ];

  const ResourceNames = resource => {
    const headerRenderer = () => ['kind', 'listKind', 'plural', 'singular'];
    const rowRenderer = entry => [
      entry.kind,
      entry.listKind,
      entry.plural,
      entry.singular,
    ];
    return (
      <GenericList
        title="Names"
        entries={resource.spec.names ? [resource.spec.names] : []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
      />
    );
  };

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ResourceNames, CustomResources]}
      {...otherParams}
    ></DefaultRenderer>
  );
};

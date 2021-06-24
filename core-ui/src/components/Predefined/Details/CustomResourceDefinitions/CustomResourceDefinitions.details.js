import React from 'react';
import { CustomResources } from './CustomResources.list';

import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

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
    const headerRenderer = () => [
      'Kind',
      'List Kind',
      'Plural',
      'Singular',
      'Short Names',
    ];
    const rowRenderer = entry => [
      entry.kind,
      entry.listKind,
      entry.plural,
      entry.singular,
      entry.shortNames?.join(', ') || EMPTY_TEXT_PLACEHOLDER,
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

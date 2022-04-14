import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { getValue, useGetTranslation } from './helpers';

export const CreateExtensibilityList = metadata => {
  const { title, headers, columns, resource: resPath } = metadata;

  const Element = res => {
    const result = getValue(res, resPath);

    const translate = useGetTranslation();

    const headerRenderer = () =>
      headers.map(h => {
        return translate(h);
      });

    const rowRenderer = resource => {
      return (
        columns?.map(column =>
          column.split('.').reduce((prevRes, curr) => {
            return prevRes?.[curr] ? prevRes[curr] : null;
          }, resource),
        ) || []
      );
    };
    return (
      <GenericList
        key={translate(title)}
        title={translate(title)}
        showSearchField={false}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={result || []}
      />
    );
  };

  return Element;
};

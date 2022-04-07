import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';

export const CreateExtensibilityList = metadata => {
  const { title, headers, columns, resource: resPath } = metadata;

  const headerRenderer = () => headers;

  const rowRenderer = condition => {
    return (
      columns.map(column =>
        column.split('.').reduce((prevRes, curr) => {
          return prevRes?.[curr] ? prevRes[curr] : null;
        }, condition),
      ) || []
    );
  };

  return res => {
    const result = resPath.split('.').reduce((prevRes, curr) => {
      return prevRes[curr];
    }, res);

    return (
      <GenericList
        key={title}
        title={title}
        showSearchField={false}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={result || []}
      />
    );
  };
};

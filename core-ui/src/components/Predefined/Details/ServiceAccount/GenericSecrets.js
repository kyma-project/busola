import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export const GenericSecrets = ({ namespace, listKey, filter, title }) => {
  const secretsUrl = `/api/v1/namespaces/${namespace}/secrets`;
  return (
    <ComponentForList
      name={title}
      key={listKey}
      params={{
        hasDetailsView: true,
        fixedPath: true,
        resourceUrl: secretsUrl,
        resourceType: 'secrets',
        namespace,
        isCompact: true,
        showTitle: true,
        filter,
      }}
    />
  );
};

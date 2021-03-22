import React from 'react';
import { GenericList } from 'react-shared';

const RepositoryUrls = addon => {
  const headerRenderer = _ => ['URL'];
  const rowRenderer = repo => [repo.url];
  console.log(addon);
  return (
    <GenericList
      key="repository-urls"
      title="Repository URLs"
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={addon.status.repositories}
    />
  );
};

export const ClusterAddonsConfigurationsDetails = DefaultRenderer => ({
  ...otherParams
}) => {
  return (
    <DefaultRenderer customComponents={[RepositoryUrls]} {...otherParams} />
  );
};

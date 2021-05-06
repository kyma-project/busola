import React from 'react';
import { GenericList, StatusBadge } from 'react-shared';

const RepositoryUrls = addon => {
  const headerRenderer = _ => ['URL', 'Status'];
  const rowRenderer = repo => [
    repo.url,
    <StatusBadge tooltipContent={repo.message} autoResolveType>
      {repo.status}
    </StatusBadge>,
  ];

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

export const AddonsConfigurationsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  return (
    <DefaultRenderer customComponents={[RepositoryUrls]} {...otherParams} />
  );
};
export const ClusterAddonsConfigurationsDetails = AddonsConfigurationsDetails;

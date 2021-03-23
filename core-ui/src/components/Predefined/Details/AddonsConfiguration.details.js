import React from 'react';
import { GenericList, StatusBadge } from 'react-shared';

const URLstatus = ({ repository }) => {
  const badge = <StatusBadge autoResolveType>{repository.status}</StatusBadge>;

  return repository.message ? (
    <details className="repository-url">
      <summary style={{ cursor: 'pointer' }}>{badge}</summary>
      <p className="fd-alert fd-alert--dismissible">{repository.message}</p>
    </details>
  ) : (
    badge
  );
};

const RepositoryUrls = addon => {
  const headerRenderer = _ => ['URL', 'Status'];
  const rowRenderer = repo => [repo.url, <URLstatus repository={repo} />];

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

export const AddonsConfigurationsDetails = DefaultRenderer => ({
  ...otherParams
}) => {
  return (
    <DefaultRenderer customComponents={[RepositoryUrls]} {...otherParams} />
  );
};
export const ClusterAddonsConfigurationsDetails = AddonsConfigurationsDetails;

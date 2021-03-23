import React from 'react';
import { StatusBadge } from 'react-shared';
import './AddonsConfigurations.list.scss';

const URL_SUMMARY_DIGIT = 23;

const RepositoryUrlList = ({ addonStatus }) => (
  <div className="addons__repository">
    {(addonStatus.repositories || []).map(r => (
      <>
        <span
          className="addons__repository-url"
          key={r.url + 'summary'}
          title={r.url}
        >
          {r.url.length > URL_SUMMARY_DIGIT
            ? '…' + r.url.slice(-URL_SUMMARY_DIGIT)
            : r.url}
        </span>
        <StatusBadge
          key={r.url + 'status'}
          tooltipContent={r.message}
          autoResolveType
        >
          {r.status}
        </StatusBadge>
      </>
    ))}
  </div>
);
const repositoryUrlsColumn = {
  header: 'Repository URLs',
  value: addon => <RepositoryUrlList addonStatus={addon.status} />,
};

export const AddonsConfigurationsList = DefaultRenderer => ({
  ...otherParams
}) => {
  const customColumns = [repositoryUrlsColumn];
  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

export const ClusterAddonsConfigurationsList = AddonsConfigurationsList;

import React from 'react';
import { StatusBadge } from 'react-shared';
import './AddonsConfigurations.list.scss';
import { Badge } from 'fundamental-react';

const calculatePodState = pod => {
  const containerStatuses = pod?.status?.containerStatuses;
  if (containerStatuses?.length > 0) {
    const waitingStatus = containerStatuses
      .reverse()
      .find(element => element.state.waiting);
    if (waitingStatus) {
      return {
        status: waitingStatus.state.waiting.reason || 'Waiting',
        message: waitingStatus.state.waiting.message,
      };
    } else {
      const terminatedStatus = containerStatuses
        .reverse()
        .find(element => element.state.terminated);
      if (terminatedStatus) {
        return {
          status: terminatedStatus.state.terminated.reason || 'Terminated',
          message: terminatedStatus.state.terminated.message,
        };
      }
    }
  }
  return { status: 'Running' };
};

const badgeType = status => {
  switch (status) {
    case 'Running':
    case 'Completed':
      return 'success';
    case 'Terminated':
    case 'Terminating':
    case 'PodInitializing':
      return 'info';
    default:
      return 'error';
  }
};

const URL_SUMMARY_DIGIT = 23;

const RepositoryUrlList = ({ addonStatus }) => {
  console.log(addonStatus);
  return (
    <div className="addons__repository">
      {addonStatus.repositories.map(r => (
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
            autoResolveType={true}
          >
            {r.status}
          </StatusBadge>
        </>
      ))}
    </div>
  );
};

export const ClusterAddonsConfigurationsList = DefaultRenderer => ({
  ...otherParams
}) => {
  const customColumns = [
    {
      header: 'Repository URLs',
      value: addon => <RepositoryUrlList addonStatus={addon.status} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

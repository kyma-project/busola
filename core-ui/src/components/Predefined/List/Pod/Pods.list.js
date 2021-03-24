import React from 'react';
import { StatusBadge } from 'react-shared';
import PodRestarts from './PodRestarts';

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

export const PodsList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: pod => {
        const podState = calculatePodState(pod);
        return (
          <StatusBadge
            tooltipContent={podState.message}
            type={badgeType(podState.status)}
          >
            {podState.status}
          </StatusBadge>
        );
      },
    },
    {
      header: 'Restarts',
      value: pod => <PodRestarts statuses={pod.status.containerStatuses} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

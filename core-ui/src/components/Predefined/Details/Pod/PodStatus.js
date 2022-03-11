import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

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
  return { status: pod.status?.phase || 'Unknown' };
};

const badgeType = status => {
  switch (status) {
    case 'Running':
    case 'Succeeded':
    case 'Completed':
      return 'success';
    case 'Terminated':
    case 'Pending':
    case 'Terminating':
    case 'PodInitializing':
    case 'ContainerCreating':
      return 'info';
    case 'Unknown':
      return undefined;
    default:
      return 'error';
  }
};

export function PodStatus({ pod }) {
  const { i18n } = useTranslation();

  const podState = calculatePodState(pod);

  return (
    <StatusBadge
      i18n={i18n}
      additionalContent={podState.message}
      resourceKind="pods"
      type={badgeType(podState.status)}
    >
      {podState.status}
    </StatusBadge>
  );
}

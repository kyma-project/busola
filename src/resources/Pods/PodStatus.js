import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export const calculatePodState = pod => {
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
      return 'Success';
    case 'Terminated':
    case 'Pending':
    case 'Terminating':
    case 'PodInitializing':
    case 'ContainerCreating':
      return 'Information';
    case 'Unknown':
      return 'None';
    default:
      return 'Error';
  }
};

export function PodStatus({ pod }) {
  const podState = calculatePodState(pod);
  const message = podState?.message || pod.status?.conditions?.[0]?.message;

  return (
    <StatusBadge
      additionalContent={message}
      resourceKind="pods"
      type={badgeType(podState.status)}
    >
      {podState.status}
    </StatusBadge>
  );
}

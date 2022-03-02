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
  return { status: 'Running' };
};

const badgeType = status => {
  switch (status) {
    case 'Running':
    case 'Succeeded':
      return 'success';
    case 'Pending':
      return 'info';
    case 'Unknown':
      return undefined;
    default:
      return 'error';
  }
};

export function PodStatus({ pod }) {
  const { i18n } = useTranslation();

  return (
    <StatusBadge
      i18n={i18n}
      resourceKind="pods"
      type={badgeType(pod.status.phase)}
      noTooltip
    >
      {pod.status.phase}
    </StatusBadge>
  );
}

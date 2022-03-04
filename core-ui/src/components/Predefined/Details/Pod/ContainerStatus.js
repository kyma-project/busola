import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatusBadge } from 'react-shared';

export function ContainerStatus({ status }) {
  const { i18n } = useTranslation();

  const state =
    status.state.running || status.state.waiting || status.state.terminated;

  const message = state.message || null;

  const badgeType = status => {
    switch (status) {
      case 'Running':
      case 'Completed':
      case 'Succeeded':
        return 'success';
      case 'ContainerCreating':
      case 'Initing':
      case 'Pending':
      case 'PodInitializing':
      case 'Terminating':
        return 'info';
      case 'Unknown':
        return undefined;
      default:
        return 'error';
    }
  };

  return (
    <div>
      <StatusBadge
        i18n={i18n}
        resourceKind="containers"
        additionalContent={message}
        type={badgeType(state.reason || 'Running')}
      >
        {state.reason || 'Running'}
      </StatusBadge>
    </div>
  );
}

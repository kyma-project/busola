import React from 'react';
import { StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';

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

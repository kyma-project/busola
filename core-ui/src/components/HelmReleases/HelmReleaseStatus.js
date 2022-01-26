import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function HelmReleaseStatus({ release }) {
  const { i18n } = useTranslation();
  const status = release.info.status;

  const type = status === 'deployed' ? 'success' : 'info';

  return (
    <StatusBadge resourceKind="secrets.helm" i18n={i18n} type={type} noTooltip>
      {status}
    </StatusBadge>
  );
}

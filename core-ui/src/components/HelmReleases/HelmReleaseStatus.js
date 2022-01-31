import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function HelmReleaseStatus({ status }) {
  const { i18n } = useTranslation();

  const type = status === 'deployed' ? 'success' : 'info';

  return (
    <StatusBadge resourceKind="helm-releases" i18n={i18n} type={type}>
      {status}
    </StatusBadge>
  );
}

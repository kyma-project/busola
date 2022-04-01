import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export function HelmReleaseStatus({ status }) {
  const { i18n } = useTranslation();

  const resolveType = status => {
    switch (status) {
      case 'deployed':
        return 'positive';
      case 'uninstalling':
        return 'critical';
      case 'failed':
        return 'negative';
      case 'unknown':
        return undefined;
      default:
        return 'informative';
    }
  };

  return (
    <StatusBadge
      resourceKind="helm-releases"
      i18n={i18n}
      type={resolveType(status)}
    >
      {status}
    </StatusBadge>
  );
}

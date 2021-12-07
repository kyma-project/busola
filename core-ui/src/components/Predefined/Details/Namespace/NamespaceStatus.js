import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function NamespaceStatus({ namespaceStatus }) {
  const { i18n } = useTranslation();

  const badgeType = status => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Terminating':
        return 'info';
      default:
        return 'error';
    }
  };

  return (
    <StatusBadge
      resourceKind="namespaces"
      type={badgeType(namespaceStatus.phase)}
      i18n={i18n}
    >
      {namespaceStatus.phase}
    </StatusBadge>
  );
}

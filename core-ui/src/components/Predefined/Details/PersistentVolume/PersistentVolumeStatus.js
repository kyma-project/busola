import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

export function PersistentVolumeStatus({ status }) {
  const { i18n } = useTranslation();

  const badgeType = status => {
    switch (status) {
      case 'Bound':
      case 'Active':
        return 'success';
      case 'Released':
      case 'Pending':
        return 'info';
      default:
        return 'error';
    }
  };

  return (
    <StatusBadge
      resourceKind="pv"
      type={badgeType(status?.phase)}
      i18n={i18n}
      additionalContent={status?.message}
    >
      {status?.phase}
    </StatusBadge>
  );
}

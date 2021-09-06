import React from 'react';

import { StatusBadge } from 'react-shared';

export function CertificateStatus({ status }) {
  const getStatusType = () => {
    switch (status.state) {
      case 'Pending':
        return 'informative';
      case 'Error':
        return 'negative';
      case 'Ready':
        return 'positive';
      default:
        return null;
    }
  };

  if (!status) {
    return '-';
  }

  return (
    <StatusBadge type={getStatusType()} tooltipContent={status.message}>
      {status.state}
    </StatusBadge>
  );
}

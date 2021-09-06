import React from 'react';

import { StatusBadge } from 'react-shared';

export function IssuerStatus({ status }) {
  const getStatusType = status => {
    switch (status) {
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

  return <StatusBadge type={getStatusType(status)}>{status}</StatusBadge>;
}

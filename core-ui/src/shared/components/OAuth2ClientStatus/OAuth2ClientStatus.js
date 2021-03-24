import React from 'react';
import { StatusBadge } from 'react-shared';

export const OAuth2ClientStatus = ({ client }) => {
  const error = client.status?.reconciliationError || {};
  const { code, description } = error;

  if (!code) {
    return <StatusBadge type="success">OK</StatusBadge>;
  }

  return (
    <StatusBadge type="error" tooltipContent={description}>
      {code}
    </StatusBadge>
  );
};

import React from 'react';
import { StatusBadge } from 'react-shared';

export const OAuth2ClientsList = DefaultRenderer => ({ ...otherParams }) => {
  const getOAuthClientStatus = client => {
    const error = client.spec.reconciliationError;
    if (!error) {
      return <StatusBadge type="success">OK</StatusBadge>;
    }

    const { code, description } = error;
    return (
      <StatusBadge type="error" tooltipContent={description}>
        {code}
      </StatusBadge>
    );
  };

  const customColumns = [
    {
      header: 'Secret',
      value: client => {
        return client.spec.secretName;
      },
    },
    {
      header: 'Status',
      value: client => {
        return getOAuthClientStatus(client);
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

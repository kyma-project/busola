import React from 'react';
import { StatusBadge } from 'react-shared';

export const OAuth2ClientsList = DefaultRenderer => ({ ...otherParams }) => {
  const description = (
    <span>
      {'See the "Expose and secure a service" section in the '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://kyma-project.io/docs/components/api-gateway#tutorials-expose-and-secure-a-service"
      >
        documentation
      </a>
      {' to find out more.'}
    </span>
  );

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

  return (
    <DefaultRenderer
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};

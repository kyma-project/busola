import React from 'react';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';

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

  const customColumns = [
    {
      header: 'Secret',
      value: client => {
        return client.spec.secretName;
      },
    },
    {
      header: 'Status',
      value: client => <OAuth2ClientStatus client={client} />,
    },
  ];

  return (
    <DefaultRenderer
      description={description}
      customColumns={customColumns}
      resourceName="OAuth2 Clients"
      {...otherParams}
    />
  );
};

import React from 'react';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';

export const OAuth2ClientsList = ({ DefaultRenderer, ...otherParams }) => {
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
      customColumns={customColumns}
      resourceName="OAuth2 Clients"
      {...otherParams}
    />
  );
};

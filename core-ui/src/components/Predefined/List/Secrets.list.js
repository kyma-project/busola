import React from 'react';
import { CreateSecretForm } from '../../../shared/components/CreateSecretForm/CreateSecretForm';

export const SecretsList = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Type',
      value: secret => {
        return secret.type;
      },
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      {...otherParams}
      listHeaderActions={
        <CreateSecretForm namespaceId={otherParams.namespace} />
      }
    />
  );
};

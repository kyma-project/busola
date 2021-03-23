import React from 'react';

export const SecretsList = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Type',
      value: secret => {
        return secret.type;
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

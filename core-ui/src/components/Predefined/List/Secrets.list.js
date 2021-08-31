import React from 'react';
import { useTranslation } from 'react-i18next';

export const SecretsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('secrets.headers.type'),
      value: secret => {
        return secret.type;
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

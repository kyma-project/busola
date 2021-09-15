import React from 'react';
import { ControlledByKind } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const SecretsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: deployment => {
        return (
          <ControlledByKind
            ownerReferences={deployment.metadata.ownerReferences}
          />
        );
      },
    },
    {
      header: t('secrets.headers.type'),
      value: secret => {
        return secret.type;
      },
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

import React from 'react';
import { useTranslation } from 'react-i18next';

import { IssuerStatus } from '../Details/Issuer/IssuerStatus';

export const IssuersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => <IssuerStatus status={issuer.status.state} />,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

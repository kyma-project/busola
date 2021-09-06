import React from 'react';
import { useTranslation } from 'react-i18next';

import { IssuerDomains } from './IssuerDomains';
import { IssuerStatus } from './IssuerStatus';

export function IssuersDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => <IssuerStatus status={issuer.status} />,
    },
    {
      header: t('issuers.server'),
      value: issuer => issuer.spec.acme?.server || '-',
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[IssuerDomains]}
      {...otherParams}
    ></DefaultRenderer>
  );
}

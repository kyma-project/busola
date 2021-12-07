import React from 'react';
import { ResourceStatus } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { IssuerDomains } from './IssuerDomains';

export function IssuersDetails({ DefaultRenderer, ...otherParams }) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => (
        <ResourceStatus
          status={issuer.status}
          resourceKind="issuers"
          i18n={i18n}
        />
      ),
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

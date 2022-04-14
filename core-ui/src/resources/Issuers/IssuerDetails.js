import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { IssuerDomains } from './IssuerDomains';
import { IssuerCreate } from './IssuerCreate';

export function IssuerDetails(props) {
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
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[IssuerDomains]}
      createResourceForm={IssuerCreate}
      {...props}
    />
  );
}

export default IssuerDetails;

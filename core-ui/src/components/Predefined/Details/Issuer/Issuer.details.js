import React from 'react';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useTranslation } from 'react-i18next';

import { IssuerDomains } from './IssuerDomains';
import { IssuersCreate } from '../../Create/Issuers/Issuers.create';

function IssuersDetails(props) {
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
      createResourceForm={IssuersCreate}
      {...props}
    />
  );
}

export default IssuersDetails;

import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { CertificateDate } from 'shared/components/CertificateDate/CertificateDate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { CertificateCreate } from './CertificateCreate';
import { CertificateRefs } from './CertificateRefs';

export function CertificateDetails(props) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.state'),
      value: certificate => (
        <ResourceStatus
          status={certificate.status}
          resourceKind="certificates"
          i18n={i18n}
        />
      ),
    },
    {
      header: t('certificates.expiration-date'),
      value: certificate =>
        certificate.status?.expirationDate ? (
          <CertificateDate
            date={certificate.status.expirationDate}
            lang={i18n.language}
          />
        ) : (
          EMPTY_TEXT_PLACEHOLDER
        ),
    },
    {
      header: t('certificates.common-name'),
      value: certificate =>
        certificate.spec?.commonName
          ? certificate.spec.commonName
          : EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[CertificateRefs]}
      createResourceForm={CertificateCreate}
      {...props}
    />
  );
}

export default CertificateDetails;

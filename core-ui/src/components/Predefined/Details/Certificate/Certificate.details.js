import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';

import { CertificateRefs } from './CertificateRefs';
import { CertificateStatus } from './CertificateStatus';

export function CertificatesDetails({ DefaultRenderer, ...otherParams }) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.state'),
      value: certificate => (
        <CertificateStatus status={certificate.status?.state} />
      ),
    },
    {
      header: t('certificates.expiration-date'),
      value: certificate =>
        certificate.status?.expirationDate ? (
          <FormattedDatetime
            date={certificate.status.expirationDate}
            lang={i18n.language}
          />
        ) : (
          '-'
        ),
    },
    {
      header: t('certificates.common-name'),
      value: certificate => certificate.spec.commonName,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[CertificateRefs]}
      {...otherParams}
    ></DefaultRenderer>
  );
}

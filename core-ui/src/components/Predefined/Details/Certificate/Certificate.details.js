import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';

import { CertificateRefs } from './CertificateRefs';

export function CertificatesDetails({ DefaultRenderer, ...otherParams }) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.state'),
      value: certificate => certificate.status.state,
    },
    {
      header: t('certificates.expiration-date'),
      value: certificate => {
        console.log(certificate.status);
        return (
          <FormattedDatetime
            date={certificate.status.expirationDate}
            lang={i18n.language}
          />
        );
      },
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

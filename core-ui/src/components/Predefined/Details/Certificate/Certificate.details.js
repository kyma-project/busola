import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';

import { CertificateRefs } from './CertificateRefs';
import { CertificateStatus } from './CertificateStatus';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

export function CertificatesDetails({ DefaultRenderer, ...otherParams }) {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.state'),
      value: certificate => <CertificateStatus status={certificate.status} />,
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
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[CertificateRefs]}
      {...otherParams}
    ></DefaultRenderer>
  );
}

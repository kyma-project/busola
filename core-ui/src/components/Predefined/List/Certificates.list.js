import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';

import { IssuerLink } from '../Details/Certificate/IssuerLink';
import { CertificateStatus } from '../Details/Certificate/CertificateStatus';

export const CertificatesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.issuer'),
      value: certificate => (
        <IssuerLink issuerRef={certificate.status?.issuerRef} />
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
      header: t('certificates.state'),
      value: certificate => (
        <CertificateStatus status={certificate.status?.state} />
      ),
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

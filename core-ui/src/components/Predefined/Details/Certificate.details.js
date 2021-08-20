import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { FormattedDatetime } from 'react-shared';

export function CertificatesDetails({ DefaultRenderer, ...otherParams }) {
  const { t, i18n } = useTranslation();

  const goToIssuer = certificate => {
    const { name, namespace } = certificate.status.issuerRef;
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(`namespaces/${namespace}/issuers/details/${name}`);
  };

  const customColumns = [
    {
      header: t('certificates.issuer'),
      value: certificate => (
        <Link onClick={() => goToIssuer(certificate)}>
          {certificate.status.issuerRef.name}
        </Link>
      ),
    },
    {
      header: t('certificates.state'),
      value: certificate => certificate.status.state,
    },
    {
      header: t('certificates.expiration-date'),
      value: certificate => (
        <FormattedDatetime
          date={certificate.status.expirationDate}
          lang={i18n.language}
        />
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
      {...otherParams}
    ></DefaultRenderer>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';

import { IssuerLink } from '../Details/Certificate/IssuerLink';

export const CertificatesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.issuer'),
      value: certificate => {
        console.log('issuerRef', certificate.status.issuerRef);
        return <IssuerLink issuerRef={certificate.status.issuerRef} />;
      },
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
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { FormattedDatetime } from 'react-shared';

import { goToIssuer } from '../Details/Certificate/helpers';

export const CertificatesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

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
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

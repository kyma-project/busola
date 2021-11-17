import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormattedDatetime } from 'react-shared';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

import { IssuerLink } from '../Details/Certificate/IssuerLink';
import { CertificateStatus } from '../Details/Certificate/CertificateStatus';

export const CertificatesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('certificates.common-name'),
      value: certificate => certificate.status?.commonName || '-',
    },
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
      value: certificate => <CertificateStatus status={certificate.status} />,
    },
  ];

  const description = (
    <Trans i18nKey="certificates.description">
      <Link
        className="fd-link"
        url="https://cert-manager.io/docs/concepts/certificate/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};

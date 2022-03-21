import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormattedDatetime,
  ResourceStatus,
  ResourcesList,
  Link,
} from 'react-shared';
import { Trans } from 'react-i18next';
import { CertificatesCreate } from '../Create/Certificates/Certificates.create';
import { IssuerLink } from '../Details/Certificate/IssuerLink';

const CertificatesList = props => {
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
      value: certificate => (
        <ResourceStatus
          status={certificate.status}
          resourceKind="certificates"
          i18n={i18n}
        />
      ),
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
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={CertificatesCreate}
      {...props}
    />
  );
};
export default CertificatesList;

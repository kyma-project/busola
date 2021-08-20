import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { ComponentForList } from 'shared/getComponents';

export function IssuersDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  // const goToIssuer = certificate => {
  // const { name, namespace } = certificate.status.issuerRef;
  // LuigiClient.linkManager()
  // .fromContext('cluster')
  // .navigate(`namespaces/${namespace}/issuers/details/${name}`);
  // };

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email,
    },
    {
      header: t('issuers.state'),
      value: issuer => issuer.status.state,
    },
    {
      header: t('issuers.server'),
      value: issuer => issuer.spec.acme?.server,
    },
    {
      header: t('issuers.domains'),
      value: issuer => (
        <ul>
          {issuer.spec.acme?.domains.include.map(domain => (
            <li>{domain}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
}

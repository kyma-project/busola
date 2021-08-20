import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';

export const IssuersList = ({ DefaultRenderer, ...otherParams }) => {
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
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};

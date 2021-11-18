import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

import { IssuerStatus } from '../Details/Issuer/IssuerStatus';

export const IssuersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => <IssuerStatus status={issuer.status} />,
    },
  ];

  const description = (
    <Trans i18nKey="issuers.description">
      <Link
        className="fd-link"
        url="https://cert-manager.io/docs/concepts/issuer/"
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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, ResourceStatus } from 'react-shared';
import { Trans } from 'react-i18next';

export const IssuersList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => (
        <ResourceStatus status={issuer.status} resourceKind="issuers" />
      ),
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

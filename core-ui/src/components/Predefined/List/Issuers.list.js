import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, ResourceStatus, ResourcesList } from 'react-shared';
import { Trans } from 'react-i18next';
import { IssuersCreate } from '../Create/Issuers/Issuers.create';

const IssuersList = props => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('issuers.email'),
      value: issuer => issuer.spec.acme?.email || '-',
    },
    {
      header: t('issuers.state'),
      value: issuer => (
        <ResourceStatus
          status={issuer.status}
          resourceKind="issuers"
          i18n={i18n}
        />
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
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={IssuersCreate}
      {...props}
    />
  );
};

export default IssuersList;

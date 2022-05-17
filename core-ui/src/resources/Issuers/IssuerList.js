import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { IssuerCreate } from './IssuerCreate';

export function IssuerList(props) {
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
      <ExternalLink
        className="fd-link"
        url="https://cert-manager.io/docs/concepts/issuer/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={IssuerCreate}
      {...props}
    />
  );
}

export default IssuerList;

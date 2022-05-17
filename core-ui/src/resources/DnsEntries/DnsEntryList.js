import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { DnsEntryCreate } from './DnsEntryCreate';

export function DnsEntryList(params) {
  const { t, i18n } = useTranslation();
  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <ResourceStatus
          status={dnsentry.status}
          resourceKind="dnsentries"
          i18n={i18n}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="dnsentries.description">
      <ExternalLink
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-api-exposure/apix-01-own-domain"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName={t('dnsentries.title')}
      createResourceForm={DnsEntryCreate}
      {...params}
    />
  );
}
export default DnsEntryList;

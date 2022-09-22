import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { Link } from 'shared/components/Link/Link';

import { DnsEntryCreate } from './DnsEntryCreate';

export function DnsEntryList(params) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('dnsentries.headers.status'),
      value: dnsentry => (
        <ResourceStatus status={dnsentry.status} resourceKind="dnsentries" />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="dnsentries.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-api-exposure/apix-01-own-domain"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceTitle={t('dnsentries.title')}
      {...params}
      createResourceForm={DnsEntryCreate}
    />
  );
}
export default DnsEntryList;

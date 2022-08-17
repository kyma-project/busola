import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceStatus } from 'shared/components/ResourceStatus/ResourceStatus';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { DnsProviderCreate } from './DnsProviderCreate';

const Domains = resource => {
  const { t } = useTranslation();

  const headerRenderer = () => [t('dnsproviders.domains')];

  const rowRenderer = entry => [
    <span style={{ overflowWrap: 'anywhere' }}>{entry}</span>,
  ];
  if (!(resource.spec.domains?.include || resource.spec.domains?.exclude)) {
    return null;
  }
  return (
    <div className="panel-grid">
      <GenericList
        title={t('dnsproviders.headers.include')}
        entries={resource.spec.domains?.include || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="daemon-set-images"
        showHeader={false}
        disableMargin={true}
      />

      <GenericList
        title={t('dnsproviders.headers.exclude')}
        entries={resource.spec.domains?.exclude || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="domains-exclude"
        showHeader={false}
        disableMargin={true}
      />
    </div>
  );
};

export function DnsProviderDetails(props) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('dnsproviders.headers.type'),
      value: dnsprovider => {
        return dnsprovider.spec.type;
      },
    },
    {
      header: t('dnsproviders.headers.status'),
      value: dnsprovider => (
        <ResourceStatus
          status={dnsprovider.status}
          resourceKind="dnsproviders"
        />
      ),
    },
  ];

  return (
    <ResourceDetails
      customComponents={[Domains]}
      customColumns={customColumns}
      createResourceForm={DnsProviderCreate}
      {...props}
    />
  );
}
export default DnsProviderDetails;

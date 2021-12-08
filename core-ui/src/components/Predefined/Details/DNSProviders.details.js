import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList, ResourceStatus } from 'react-shared';

const Domains = resource => {
  const { t, i18n } = useTranslation();

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
        hasExternalMargin={false}
        i18n={i18n}
      />

      <GenericList
        title={t('dnsproviders.headers.exclude')}
        entries={resource.spec.domains?.exclude || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        testid="domains-exclude"
        showHeader={false}
        hasExternalMargin={false}
        i18n={i18n}
      />
    </div>
  );
};

export const DNSProvidersDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

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
          i18n={i18n}
        />
      ),
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[Domains]}
      customColumns={customColumns}
      {...otherParams}
    ></DefaultRenderer>
  );
};

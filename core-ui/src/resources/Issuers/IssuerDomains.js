import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList } from 'shared/components/GenericList/GenericList';

export function IssuerDomains(issuer) {
  const { t } = useTranslation();
  return (
    <div className="panel-grid">
      <GenericList
        key="included-domains"
        title={t('issuers.domains.included')}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        className="fd-margin--xs"
        entries={issuer.spec.acme?.domains?.include || []}
        searchSettings={{
          showSearchField: false,
        }}
      />
      <GenericList
        key="excluded-domains"
        title={t('issuers.domains.excluded')}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        className="fd-margin--xs"
        entries={issuer.spec.acme?.domains?.exclude || []}
        searchSettings={{
          showSearchField: false,
        }}
      />
    </div>
  );
}

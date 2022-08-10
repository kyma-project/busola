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
        showSearchField={false}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        disableMargin={true}
        entries={issuer.spec.acme?.domains?.include || []}
      />
      <GenericList
        key="excluded-domains"
        title={t('issuers.domains.excluded')}
        showSearchField={false}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        disableMargin={true}
        entries={issuer.spec.acme?.domains?.exclude || []}
      />
    </div>
  );
}

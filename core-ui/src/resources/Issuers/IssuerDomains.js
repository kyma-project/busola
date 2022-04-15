import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericList } from 'shared/components/GenericList/GenericList';

export function IssuerDomains(issuer) {
  const { t, i18n } = useTranslation();
  return (
    <div className="panel-grid">
      <GenericList
        key="included-domains"
        title={t('issuers.domains.included')}
        showSearchField={false}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        hasExternalMargin={false}
        entries={issuer.spec.acme?.domains?.include || []}
        i18n={i18n}
      />
      <GenericList
        key="excluded-domains"
        title={t('issuers.domains.excluded')}
        showSearchField={false}
        headerRenderer={() => []}
        rowRenderer={domain => [domain]}
        showHeader={false}
        hasExternalMargin={false}
        entries={issuer.spec.acme?.domains?.exclude || []}
        i18n={i18n}
      />
    </div>
  );
}

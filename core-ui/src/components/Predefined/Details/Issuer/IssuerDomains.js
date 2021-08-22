import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';

export function IssuerDomains(issuer) {
  const { t } = useTranslation();
  return (
    <GenericList
      key="domains"
      title={t('issuers.domains')}
      showSearchField={false}
      headerRenderer={() => []}
      rowRenderer={domain => [domain]}
      showHeader={false}
      entries={issuer.spec.acme?.domains.include || []}
    />
  );
}

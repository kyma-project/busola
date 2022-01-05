import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';

export function ServiceGateways(service) {
  const { t } = useTranslation();

  const headerRenderer = () => [t('virtualservices.gateways')];

  const rowRenderer = gateway => [gateway];

  return (
    <GenericList
      key="gateways"
      title={t('virtualservices.gateways')}
      showSearchField={false}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      showHeader={false}
      entries={service.spec.gateways || []}
    />
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';

export function ServiceHosts(service) {
  const { t } = useTranslation();

  const headerRenderer = () => [t('virtualservices.hosts')];

  const rowRenderer = host => [host];

  return (
    <GenericList
      key="gateways"
      title={t('virtualservices.hosts')}
      showSearchField={false}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      showHeader={false}
      entries={service.spec.hosts || []}
    />
  );
}

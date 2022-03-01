import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';

export function ServiceHosts(service) {
  const { t } = useTranslation();

  const headerRenderer = () => [t('virtualservices.hosts')];

  const rowRenderer = host => [host];

  return (
    <GenericList
      title={t('virtualservices.hosts')}
      showSearchField={false}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      showHeader={false}
      entries={service.spec.hosts || []}
    />
  );
}

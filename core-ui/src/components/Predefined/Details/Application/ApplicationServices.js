import React from 'react';
import { GenericList } from 'react-shared';
import { useTranslation } from 'react-i18next';

export default function ApplicationServices({ spec: applicationSpec }) {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('common.headers.name'),
    t('applications.headers.apis'),
    t('applications.headers.events'),
  ];

  const entries = applicationSpec.services.map(e => ({
    displayName: e.displayName,
    eventsCount: e.entries.filter(t => t.type === 'Events').length,
    apisCount: e.entries.filter(t => t.type === 'API').length,
  }));

  const rowRenderer = e => [e.displayName, e.apisCount, e.eventsCount];

  return (
    <GenericList
      key="application-services"
      title={t('applications.subtitle.provided-services')}
      textSearchProperties={['displayName']}
      entries={entries}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      notFoundMessage={t('applications.messages.service-not-found')}
    />
  );
}

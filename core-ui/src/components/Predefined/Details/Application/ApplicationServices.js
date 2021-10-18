import React from 'react';
import { Link } from 'fundamental-react';
import { GenericList } from 'react-shared';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';

export default function ApplicationServices({ spec: applicationSpec }) {
  const { t, i18n } = useTranslation();

  const navigateToDetails = resourceName => {
    LuigiClient.linkManager().navigate(resourceName);
  };

  const headerRenderer = () => [
    t('common.headers.name'),
    t('applications.headers.apis'),
    t('applications.headers.events'),
  ];

  const entries = applicationSpec.services.map(e => ({
    displayName: (
      <Link className="fd-link" onClick={_ => navigateToDetails(e.name)}>
        {e.displayName}
      </Link>
    ),
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
      i18n={i18n}
    />
  );
}

import React from 'react';
import { EventList as EventListComponent } from 'resources/Events/EventList';
import { useTranslation } from 'react-i18next';

export function EventsList({
  namespace = null,
  filter,
  defaultType,
  hideInvolvedObjects,
}) {
  const { i18n } = useTranslation();
  const resourceUrl = namespace
    ? `/api/v1/namespaces/${namespace}/events`
    : '/api/v1/events';

  const eventsParams = {
    namespace: namespace,
    resourceUrl: resourceUrl,
    resourceType: 'Events',
    isCompact: true,
    defaultType,
    hideInvolvedObjects,
    filter,
    i18n,
  };

  return <EventListComponent {...eventsParams} />;
}

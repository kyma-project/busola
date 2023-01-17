import React from 'react';
import { EventList as EventListComponent } from 'resources/Events/EventList';

export function EventsList({
  namespace = null,
  filter,
  defaultType,
  hideInvolvedObjects,
}) {
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
    updateTitle: false,
  };

  return <EventListComponent {...eventsParams} />;
}

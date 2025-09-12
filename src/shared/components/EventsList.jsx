import React from 'react';
import { EventList as EventListComponent } from 'resources/Events/EventList';

export function EventsList({
  namespace = null,
  filter,
  defaultType,
  hideInvolvedObjects,
  isClusterView,
}) {
  const resourceUrl = namespace
    ? `/api/v1/namespaces/${namespace}/events`
    : '/api/v1/events';

  const eventsParams = {
    disableHiding: true,
    displayArrow: false,
    namespace: namespace,
    resourceUrl: resourceUrl,
    resourceType: 'Events',
    isCompact: true,
    defaultType,
    hideInvolvedObjects,
    filter,
    isClusterView,
    updateTitle: false,
  };

  return <EventListComponent {...eventsParams} />;
}

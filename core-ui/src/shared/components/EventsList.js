import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function EventsList({ namespace = null, filter }) {
  const resourceUrl = namespace
    ? `/api/v1/namespaces/${namespace}/events`
    : '/api/v1/events';

  const eventsParams = {
    namespace: namespace,
    resourceUrl: resourceUrl,
    resourceType: 'Events',
    isCompact: true,
    filter,
  };

  return (
    <ComponentForList
      name="eventsList"
      params={eventsParams}
      key="eventslist"
    />
  );
}

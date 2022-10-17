import React from 'react';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { EventList as EventListComponent } from 'resources/Events/EventList';

import { useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';

export function EventList({
  structure,
  originalResource,
  scope,
  value,
  arrayItems,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const { widgetT } = useGetTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    scope,
    value,
    arrayItems,
  });

  const renameDefaultType = defaultType => {
    switch ((defaultType || '').toLowerCase()) {
      case 'information':
        return 'NORMAL';
      case 'warning':
        return 'WARNING';
      default:
        return 'ALL';
    }
  };

  const defaultType =
    EVENT_MESSAGE_TYPE[renameDefaultType(structure.defaultType)];

  const resourceUrl = namespaceId
    ? `/api/v1/namespaces/${namespaceId}/events`
    : '/api/v1/events';

  const filter = res => {
    if (!structure.filter) return true;

    try {
      const [eventFilter, eventFilterError] = jsonata(structure.filter, {
        scope: res,
      });
      if (eventFilterError) return false;
      return !!eventFilter;
    } catch (e) {
      return false;
    }
  };

  const eventsParams = {
    namespace: namespaceId,
    resourceUrl: resourceUrl,
    resourceType: 'Events',
    hideInvolvedObjects: structure?.hideInvolvedObjects,
    isCompact: true,
    title: widgetT(structure),
    defaultType,
    filter,
  };

  return <EventListComponent {...eventsParams} />;
}

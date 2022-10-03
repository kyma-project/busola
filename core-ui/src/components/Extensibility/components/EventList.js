import React from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EVENT_MESSAGE_TYPE } from 'hooks/useMessageList';
import { useGetTranslation } from '../helpers';
import { EventList as EventListComponent } from 'resources/Events/EventList';
import { useJsonataEvaluate } from './hooks/useJsonataEvaluate';

export function EventList({ structure, originalResource }) {
  const { namespaceId } = useMicrofrontendContext();
  const { widgetT } = useGetTranslation();
  const jsonataFn = useJsonataEvaluate(originalResource);

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
      return !!jsonataFn(structure.filter, { item: res });
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

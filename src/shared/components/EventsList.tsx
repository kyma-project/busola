import { EventList as EventListComponent } from 'resources/Events/EventList';

interface EventsListProps {
  namespace?: string;
  filter?: (event: any) => boolean;
  defaultType?: string;
  hideInvolvedObjects?: boolean;
  isClusterView?: boolean;
}

export function EventsList({
  namespace = '',
  filter,
  defaultType,
  hideInvolvedObjects,
  isClusterView,
}: EventsListProps) {
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

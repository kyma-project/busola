import EventsList from 'resources/Events/EventList';
import { ReactNode } from 'react';

export default function ClusterEventList(props: any): ReactNode {
  return <EventsList {...props} isClusterView={true} />;
}

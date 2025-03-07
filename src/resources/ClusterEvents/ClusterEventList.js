import { useParams } from 'react-router-dom';
import { EventsList } from 'shared/components/EventsList';

export const ClusterEventList = props => {
  const params = useParams();
  const namespace = params.namespace;
  return <EventsList namespace={namespace} isClusterView={true} {...props} />;
};

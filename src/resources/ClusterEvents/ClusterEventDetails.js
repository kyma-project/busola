import { useParams } from 'react-router-dom';
import EventDetails from 'resources/Events/EventDetails';

export const ClusterEventDetails = props => {
  const params = useParams();
  const namespace = params.namespace;
  const resourceUrl = `/api/v1/namespaces/${namespace}/events/${props.resourceName}`;
  return (
    <EventDetails
      {...props}
      isClusterView={true}
      namespace={namespace}
      resourceUrl={resourceUrl}
    />
  );
};

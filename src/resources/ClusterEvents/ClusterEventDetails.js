import { useParams } from 'react-router-dom';
import EventDetails from 'resources/Events/EventDetails';

export function ClusterEventDetails({ resourceName, ...props }) {
  const params = useParams();
  const namespace = params.namespace;
  const resourceUrl = `/api/v1/namespaces/${namespace}/events/${resourceName}`;
  return (
    <EventDetails
      {...props}
      isClusterView={true}
      namespace={namespace}
      resourceUrl={resourceUrl}
    />
  );
}

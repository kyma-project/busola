import { useParams } from 'react-router-dom';
import EventDetails from 'resources/Events/EventDetails';

export type ClusterEventDetailsProps = {
  resourceName: string;
};

export default function ClusterEventDetails({
  resourceName,
  ...props
}: ClusterEventDetailsProps) {
  const params = useParams();
  const namespace = params.namespace;
  const resourceUrl = `/api/v1/namespaces/${namespace}/events/${resourceName}`;
  console.log('details');
  return (
    <EventDetails
      {...props}
      isClusterView={true}
      namespace={namespace}
      resourceUrl={resourceUrl}
    />
  );
}

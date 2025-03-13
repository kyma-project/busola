import { useParams } from 'react-router-dom';
import EventDetails from 'resources/Events/EventDetails';
import { pathSegment } from 'resources/ClusterEvents/index';
import { useUrl } from 'hooks/useUrl';

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
  const { clusterUrl } = useUrl();

  return (
    <EventDetails
      {...props}
      layoutCloseCreateUrl={clusterUrl(pathSegment)}
      isClusterView={true}
      namespace={namespace}
      resourceUrl={resourceUrl}
    />
  );
}

import { useParams } from 'react-router';
import EventDetails from 'resources/Events/EventDetails';
import { pathSegment } from 'resources/ClusterEvents/index';
import { useUrl } from 'hooks/useUrl';

export type ClusterEventDetailsProps = {
  resourceName: string;
  resourceUrl: string | undefined;
  namespace: string | undefined;
};

export default function ClusterEventDetails({
  resourceName,
  resourceUrl,
  namespace,
  ...props
}: ClusterEventDetailsProps) {
  const params = useParams();
  const overriddenNamespace = params.namespace ?? namespace;
  const overriddenResourceUrl =
    resourceUrl && overriddenNamespace && resourceName
      ? `/api/v1/namespaces/${overriddenNamespace}/events/${resourceName}`
      : undefined;
  const { clusterUrl } = useUrl();

  return (
    <EventDetails
      {...props}
      layoutCloseCreateUrl={clusterUrl(pathSegment)}
      resourceName={resourceName}
      namespace={overriddenNamespace}
      resourceUrl={overriddenResourceUrl}
    />
  );
}

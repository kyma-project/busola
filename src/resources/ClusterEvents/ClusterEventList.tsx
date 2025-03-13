import { useParams } from 'react-router-dom';
import { EventsList } from 'shared/components/EventsList';
import { ReactNode } from 'react';

type ListProps = {
  filter?: any;
  defaultType?: string;
  hideInvolvedObjects?: boolean;
};

export default function ClusterEventList({
  filter,
  defaultType,
  hideInvolvedObjects,
}: ListProps): ReactNode {
  const params = useParams();
  const namespace = params.namespace;
  return (
    <EventsList
      namespace={namespace}
      isClusterView={true}
      filter={filter}
      defaultType={defaultType}
      hideInvolvedObjects={hideInvolvedObjects}
    />
  );
}

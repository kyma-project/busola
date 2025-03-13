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
  return (
    <EventsList
      isClusterView={true}
      filter={filter}
      defaultType={defaultType}
      hideInvolvedObjects={hideInvolvedObjects}
    />
  );
}

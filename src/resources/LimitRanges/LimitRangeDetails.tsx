import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import LimitRangeCreate from './LimitRangeCreate';
import LimitRangeSpecification from './LimitRangeSpecification';
import { ResourceDescription } from '.';

type LimitResources = {
  memory?: string;
  cpu?: string;
  storage?: string;
};

export type LimitProps = {
  type: string;
  max?: LimitResources;
  min?: LimitResources;
  default?: LimitResources;
  defaultRequest?: LimitResources;
};

export type LimitRangeProps = {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    limits: [LimitProps];
  };
};

export default function LimitRangeDetails(props: any) {
  const customComponents = [
    (resource: LimitRangeProps) => (
      <LimitRangeSpecification resource={resource} />
    ),
  ];
  console.log(props);
  return (
    <ResourceDetails
      description={ResourceDescription}
      createResourceForm={LimitRangeCreate}
      customComponents={customComponents}
      {...props}
    />
  );
}

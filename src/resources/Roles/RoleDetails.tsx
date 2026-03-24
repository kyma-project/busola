import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import RoleCreate from './RoleCreate';
import { ResourceDescription } from 'resources/Roles';

interface RoleDetailsProps {
  [key: string]: any;
}

export function RoleDetails(props: RoleDetailsProps) {
  return (
    <ResourceDetails
      {...(props as any)}
      customComponents={[Rules]}
      createResourceForm={RoleCreate}
      description={ResourceDescription}
    />
  );
}

export default RoleDetails;

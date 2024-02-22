import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { Rules } from './Rules';
import { RoleCreate } from './RoleCreate';
import { ResourceDescription } from 'resources/Roles/index';

export function RoleDetails(props) {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={RoleCreate}
      description={ResourceDescription}
    />
  );
}

export default RoleDetails;

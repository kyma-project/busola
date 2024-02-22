import { Rules } from 'resources/Roles/Rules';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

import { ClusterRoleCreate } from './ClusterRoleCreate';
import { ResourceDescription } from 'resources/ClusterRoles';

const ClusterRolesDetails = props => {
  return (
    <ResourceDetails
      {...props}
      customComponents={[Rules]}
      createResourceForm={ClusterRoleCreate}
      description={ResourceDescription}
    />
  );
};

export default ClusterRolesDetails;

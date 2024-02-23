import { GenericRoleList } from 'resources/Roles/GenericRoleList';
import ClusterRoleCreate from './ClusterRoleCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
} from 'resources/ClusterRoles';

export function ClusterList(props) {
  return (
    <GenericRoleList
      description={ResourceDescription}
      descriptionKey={i18nDescriptionKey}
      {...props}
      createResourceForm={ClusterRoleCreate}
    />
  );
}

export default ClusterList;

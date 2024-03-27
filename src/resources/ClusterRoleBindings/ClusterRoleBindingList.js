import { GenericRoleBindingList } from 'resources/RoleBindings/GenericRoleBindingList';

import ClusterRoleBindingCreate from './ClusterRoleBindingCreate';
import {
  ResourceDescription,
  i18nDescriptionKey,
} from 'resources/ClusterRoleBindings';

export function ClusterRoleBindingList(props) {
  return (
    <GenericRoleBindingList
      description={ResourceDescription}
      descriptionKey={i18nDescriptionKey}
      {...props}
      createResourceForm={ClusterRoleBindingCreate}
    />
  );
}

export default ClusterRoleBindingList;

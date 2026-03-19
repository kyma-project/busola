import RoleBindingCreate from './RoleBindingCreate';
import { GenericRoleBindingList } from './GenericRoleBindingList';
import {
  ResourceDescription,
  i18nDescriptionKey,
} from 'resources/RoleBindings';

interface RoleBindingListProps {
  [key: string]: any;
}

export function RoleBindingList(props: RoleBindingListProps) {
  return (
    <GenericRoleBindingList
      description={ResourceDescription}
      descriptionKey={i18nDescriptionKey}
      {...props}
      createResourceForm={RoleBindingCreate}
    />
  );
}

export default RoleBindingList;

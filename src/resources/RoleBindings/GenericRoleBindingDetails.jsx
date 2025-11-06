import { RoleSubjects } from './RoleSubjects.jsx';
import { RoleRef } from './RoleRef.jsx';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

export function GenericRoleBindingDetails({
  DefaultRenderer,
  description,
  ...otherParams
}) {
  return (
    <ResourceDetails
      {...otherParams}
      description={description}
      customComponents={[RoleRef, RoleSubjects]}
    />
  );
}

import { RoleSubjects } from './RoleSubjects';
import { RoleRef } from './RoleRef';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';

interface GenericRoleBindingDetailsProps {
  description: any;
  [key: string]: any;
}

export function GenericRoleBindingDetails({
  description,
  ...otherParams
}: GenericRoleBindingDetailsProps) {
  return (
    <ResourceDetails
      {...(otherParams as any)}
      description={description}
      customComponents={[RoleRef, RoleSubjects]}
    />
  );
}

import React from 'react';

import { ComboboxInput } from 'fundamental-react';
import { useGetList } from 'react-shared';

import './RoleCombobox.scss';

export const RoleCombobox = ({ setRole, setRoleKind, namespace }) => {
  const chooseRole = role => {
    setRoleKind(role.data?.roleKind);
    setRole(role.data?.roleName);
  };

  const rolesUrl = `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`;
  const {
    data: roles,
    loading: rolesLoading = true,
    error: rolesError,
  } = useGetList(() => !!namespace)(rolesUrl, { pollingInterval: 3000 });

  const clusterRolesUrl = '/apis/rbac.authorization.k8s.io/v1/clusterroles';
  const {
    data: clusterRoles,
    loading: clusterRolesLoading = true,
    error: clusterRolesError,
  } = useGetList()(clusterRolesUrl, { pollingInterval: 3000 });

  if (rolesLoading || clusterRolesLoading) return 'Loading...';
  if (rolesError) return rolesError.message;
  if (clusterRolesError) return clusterRolesError.message;

  const rolesNames = (roles || []).map(role => ({
    key: `role-${role.metadata.name}`,
    text: `${role.metadata.name} (R)`,
    data: {
      roleKind: 'Role',
      roleName: role.metadata.name,
    },
  }));
  const clusterRolesNames = (clusterRoles || []).map(role => ({
    key: `clusterrole-${role.metadata.name}`,
    text: `${role.metadata.name} (CR)`,
    data: {
      roleKind: 'ClusterRole',
      roleName: role.metadata.name,
    },
  }));

  const allRoles = [...rolesNames, ...clusterRolesNames];

  return (
    <ComboboxInput
      id="role-combobox"
      ariaLabel="Choose role"
      placeholder="Choose role..."
      className="role-combobox"
      noMatchesText="No Roles found"
      options={allRoles}
      arrowLabel="Show roles"
      selectionType="auto-inline"
      inputProps={{
        autoComplete: 'nope',
      }}
      onSelectionChange={(_, selected) => chooseRole(selected)}
    />
  );
};

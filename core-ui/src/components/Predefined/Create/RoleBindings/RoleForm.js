import React from 'react';
import * as jp from 'jsonpath';

import { ComboboxInput } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

export const RoleForm = ({ binding, setBinding, namespace }) => {
  const { t } = useTranslation();

  const handleRoleChange = role => {
    const newRole = {
      kind: role.data?.roleKind,
      name: role.data?.roleName,
    };

    jp.value(binding, '$.roleRef', newRole);
    setBinding({ ...binding });
  };

  const rolesUrl = `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`;
  const {
    data: roles,
    loading: rolesLoading = true,
    error: rolesError,
  } = useGetList()(rolesUrl, { skip: !namespace });

  const clusterRolesUrl = '/apis/rbac.authorization.k8s.io/v1/clusterroles';
  const {
    data: clusterRoles,
    loading: clusterRolesLoading = true,
    error: clusterRolesError,
  } = useGetList()(clusterRolesUrl);
  if ((!namespace ? false : rolesLoading) || clusterRolesLoading)
    return 'Loading...';
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
  const selectedRole =
    binding?.roleRef?.kind && binding?.roleRef?.name
      ? `${binding?.roleRef?.kind?.toLowerCase()}-${binding?.roleRef?.name}`
      : undefined;

  return (
    <ResourceForm.FormField
      required
      label={t('role-bindings.create-modal.role')}
      input={props => (
        <ComboboxInput
          id="role"
          ariaLabel="Role Combobox"
          arrowLabel="Role Combobox arrow"
          required
          compact
          showAllEntries
          searchFullString
          placeholder={t('common.messages.type-to-select', {
            value: t('role-bindings.name_singular'),
          })}
          options={allRoles}
          selectedKey={selectedRole}
          selectionType="auto-inline"
          onSelect={e => handleRoleChange(e.target.value)}
          {...props}
        />
      )}
    />
  );
};

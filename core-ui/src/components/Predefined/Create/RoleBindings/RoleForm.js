import React from 'react';

import { ComboboxInput } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { useTranslation } from 'react-i18next';

export const RoleForm = ({
  loading,
  error,
  allRoles,
  binding,
  handleRoleChange,
}) => {
  const { t } = useTranslation();

  if (loading) return 'Loading...';
  if (error) return error.message;

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
          onSelectionChange={(_, selected) => handleRoleChange(selected)}
          inputProps={{
            autoComplete: 'nope',
          }}
          {...props}
        />
      )}
    />
  );
};

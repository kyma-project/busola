import React from 'react';

import { Spinner } from 'shared/components/Spinner/Spinner';
import { ComboboxInput } from 'fundamental-react';
import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { ResourceFormWrapper } from 'shared/ResourceForm/components/Wrapper';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export const RoleForm = ({
  loading,
  error,
  roles,
  clusterRoles,
  binding,
  setBinding,
}) => {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();

  if (loading) return <Spinner compact={true} />;
  if (error) return error.message;

  const roleTypeDropdown = (
    <ResourceForm.FormField
      required
      label={t('role-bindings.create-modal.role-type')}
      propertyPath="$.roleRef.kind"
      input={props => (
        <Dropdown
          fullWidth={false}
          selectedKey={props.value}
          options={['Role', 'ClusterRole'].map(v => ({ key: v, text: v }))}
          {...props}
          disabled={!namespace}
        />
      )}
    />
  );

  const rolesForCurrentType =
    binding.roleRef.kind === 'ClusterRole' ? clusterRoles : roles;
  const options = (rolesForCurrentType || []).map(r => ({
    key: r.metadata.name,
    text: r.metadata.name,
  }));

  const roleNameInput = (
    <ResourceForm.FormField
      required
      label={t('role-bindings.create-modal.role')}
      propertyPath="$.roleRef.name"
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
            value: t('common.headers.resource'),
          })}
          options={options}
          selectedKey={props.value}
          typedValue={props.value}
          selectionType="manual"
          onSelectionChange={(_, selected) => props.setValue(selected.text)}
          {...props}
        />
      )}
    />
  );

  return (
    <ResourceFormWrapper resource={binding} setResource={setBinding}>
      {roleTypeDropdown}
      {roleNameInput}
    </ResourceFormWrapper>
  );
};

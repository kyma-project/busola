import { Spinner } from 'shared/components/Spinner/Spinner';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { ResourceFormWrapper } from 'shared/ResourceForm/components/Wrapper';

type RoleFormProps = {
  loading?: boolean;
  error: Error | null;
  roles: Array<{ metadata: { name: string } }>;
  clusterRoles: Array<{ metadata: { name: string } }>;
  namespace: string | null;
  binding: any;
  setBinding: (binding: any) => void;
};

export const RoleForm = ({
  loading,
  error,
  roles,
  clusterRoles,
  namespace,
  binding,
  setBinding,
}: RoleFormProps) => {
  const { t } = useTranslation();

  if (loading) return <Spinner />;
  if (error) return error.message;

  const roleTypeDropdown = (
    <ResourceForm.FormField
      required
      label={t('role-bindings.create-modal.role-type')}
      propertyPath="$.roleRef.kind"
      input={(props: any) => (
        <Dropdown
          selectedKey={props.value}
          options={['Role', 'ClusterRole'].map((v) => ({ key: v, text: v }))}
          {...props}
          setValue={(value: string) => {
            binding.roleRef.name = '';
            props.setValue(value);
          }}
          disabled={!namespace}
        />
      )}
    />
  );

  const rolesForCurrentType =
    binding.roleRef?.kind === 'ClusterRole' ? clusterRoles : roles;
  const options = (rolesForCurrentType || []).map((r) => ({
    key: r.metadata.name,
    text: r.metadata.name,
  }));

  const onChange = (event: any, props: any) => {
    const selectedOption = options.find(
      (o) => o.text === event?.target?.value,
    ) ?? {
      key: event?.target?._state?.filterValue,
      text: event?.target?._state?.filterValue,
    };
    props.setValue(selectedOption.text);
  };

  const roleNameInput = (
    <ResourceForm.FormField
      required
      label={t('role-bindings.create-modal.role')}
      propertyPath="$.roleRef.name"
      input={(props: any) => (
        <ComboBox
          id="role"
          accessibleName="Role Combobox"
          disabled={props.disabled || !options?.length}
          filter="Contains"
          ref={props.inputRef}
          placeholder={t('common.messages.type-to-select', {
            value: t(
              binding.roleRef?.kind === 'ClusterRole'
                ? 'cluster-roles.name_singular'
                : 'roles.name_singular',
            ),
          })}
          value={
            options.find((o) => o.key === props.value)?.text ?? props.value
          }
          onChange={(event) => onChange(event, props)}
          onInput={(event) => onChange(event, props)}
        >
          {options.map((option) => (
            <ComboBoxItem key={option.key} id={option.key} text={option.text} />
          ))}
        </ComboBox>
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

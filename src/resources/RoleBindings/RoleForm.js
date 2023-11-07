import { Spinner } from 'shared/components/Spinner/Spinner';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/ResourceForm/inputs';
import { ResourceFormWrapper } from 'shared/ResourceForm/components/Wrapper';

export const RoleForm = ({
  loading,
  error,
  roles,
  clusterRoles,
  namespace,
  binding,
  setBinding,
}) => {
  const { t } = useTranslation();

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
          setValue={value => {
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
        <div className="fd-col bsl-col-md--11">
          <ComboBox
            id="role"
            aria-label="Role Combobox"
            disabled={props.disabled || !options?.length}
            filter="Contains"
            inputRef={props.inputRef}
            placeholder={t('common.messages.type-to-select', {
              value: t(
                binding.roleRef?.kind === 'ClusterRole'
                  ? 'cluster-roles.name_singular'
                  : 'roles.name_singular',
              ),
            })}
            value={options.find(o => o.key === props.value)?.text ?? ''}
            onChange={event => {
              const selectedOption = options.find(
                o => o.text === event.target.value,
              );
              if (selectedOption) props.setValue(selectedOption.text);
            }}
          >
            {options.map(option => (
              <ComboBoxItem id={option.key} text={option.text} />
            ))}
          </ComboBox>
        </div>
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

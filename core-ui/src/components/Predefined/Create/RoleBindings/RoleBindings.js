import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as jp from 'jsonpath';
import { createBindingTemplate, newSubject } from './templates';
import { SingleSubjectForm, SingleSubjectInput } from './SubjectForm';
import { validateBinding } from './helpers';
import { MessageStrip } from 'fundamental-react';
import { RoleForm } from './RoleForm.js';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { useGetList } from 'react-shared';

export function RoleBindings({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();

  const [binding, setBinding] = useState(createBindingTemplate(namespace));

  React.useEffect(() => {
    setCustomValid(validateBinding(binding));
  }, [binding, setCustomValid]);

  const resourceData = namespace
    ? {
        pluralKind: 'rolebindings',
        singularName: t(`role-bindings.name_singular`),
        createUrl: `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/rolebindings/`,
      }
    : {
        pluralKind: 'clusterrolebindings',
        singularName: t(`cluster-role-bindings.name_singular`),
        createUrl: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings/',
      };

  const rolesUrl = `/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles`;
  const {
    data: roles,
    loading: namespaceRolesLoading = true,
    error: namespaceRolesError,
  } = useGetList()(rolesUrl, { skip: !namespace });

  const clusterRolesUrl = '/apis/rbac.authorization.k8s.io/v1/clusterroles';
  const {
    data: clusterRoles,
    loading: clusterRolesLoading = true,
    error: clusterRolesError,
  } = useGetList()(clusterRolesUrl);
  const rolesLoading =
    (!namespace ? false : namespaceRolesLoading) || clusterRolesLoading;
  const rolesError = namespaceRolesError || clusterRolesError;
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
  const handleRoleChange = role => {
    const newRole = {
      kind: role.data?.roleKind,
      name: role.data?.roleName,
    };
    jp.value(binding, '$.roleRef', newRole);
    setBinding({ ...binding });
  };
  return (
    <ResourceForm
      pluralKind={resourceData.pluralKind}
      singularName={resourceData.singularName}
      resource={binding}
      setResource={setBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceData.createUrl}
    >
      <ResourceForm.FormField
        required
        label={t('common.labels.name')}
        placeholder={t('components.k8s-name-input.placeholder', {
          resourceType: resourceData.singularName,
        })}
        input={Inputs.Text}
        propertyPath="$.metadata.name"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <RoleForm
        loading={rolesLoading}
        error={rolesError}
        allRoles={allRoles}
        binding={binding}
        handleRoleChange={handleRoleChange}
      />
      {jp.value(binding, '$.subjects.length') ? (
        <SingleSubjectInput simple propertyPath="$.subjects" />
      ) : (
        <MessageStrip simple type="warning" className="fd-margin-top--sm">
          {t('role-bindings.create-modal.at-least-one-subject-required', {
            resource: resourceData.singularName,
          })}
        </MessageStrip>
      )}
      <ResourceForm.ItemArray
        advanced
        propertyPath="$.subjects"
        listTitle={t('role-bindings.create-modal.subjects')}
        nameSingular={t('role-bindings.create-modal.subject')}
        entryTitle={subject => subject?.name}
        atLeastOneRequiredMessage={t(
          'role-bindings.create-modal.at-least-one-subject-required',
          { resource: resourceData.singularName },
        )}
        itemRenderer={(current, allValues, setAllValues, index) => (
          <SingleSubjectForm
            subject={current}
            subjects={allValues}
            setSubjects={setAllValues}
            index={index}
            advanced
          />
        )}
        newResourceTemplateFn={newSubject}
      />
    </ResourceForm>
  );
}

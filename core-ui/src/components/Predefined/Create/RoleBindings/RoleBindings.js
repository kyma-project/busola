import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip } from 'fundamental-react';
import * as jp from 'jsonpath';
import _ from 'lodash';

import { createBindingTemplate, newSubject } from './templates';
import { SingleSubjectForm, SingleSubjectInput } from './SubjectForm';
import { validateBinding } from './helpers';
import { RoleForm } from './RoleForm.js';
import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  ItemArray,
} from 'shared/ResourceForm/fields';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import './RoleBindings.scss';

export function RoleBindings({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialRoleBinding,
  resourceUrl,
  pluralKind,
  singularName,
}) {
  const { t } = useTranslation();

  const [binding, setBinding] = useState(
    _.cloneDeep(initialRoleBinding) || createBindingTemplate(namespace),
  );

  React.useEffect(() => {
    setCustomValid(validateBinding(binding));
  }, [binding, setCustomValid]);

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

  const handleNameChange = name => {
    jp.value(binding, '$.metadata.name', name);
    setBinding({ ...binding });
  };

  return (
    <ResourceForm
      pluralKind={pluralKind}
      singularName={singularName}
      resource={binding}
      setResource={setBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialRoleBinding}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('role-bindings.name_singular')}
        setValue={handleNameChange}
        className="fd-margin-bottom--sm"
        readOnly={!!initialRoleBinding}
        pattern="*"
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <KeyValueField
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
            resource: singularName,
          })}
        </MessageStrip>
      )}
      <ItemArray
        advanced
        defaultOpen
        propertyPath="$.subjects"
        listTitle={t('role-bindings.create-modal.subjects')}
        nameSingular={t('role-bindings.create-modal.subject')}
        entryTitle={subject => subject?.name}
        atLeastOneRequiredMessage={t(
          'role-bindings.create-modal.at-least-one-subject-required',
          { resource: singularName },
        )}
        itemRenderer={({ item, values, setValues, index }) => (
          <SingleSubjectForm
            subject={item}
            subjects={values}
            setSubjects={setValues}
            index={index}
          />
        )}
        newResourceTemplateFn={newSubject}
      />
    </ResourceForm>
  );
}

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { MessageStrip } from 'fundamental-react';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { ItemArray } from 'shared/ResourceForm/fields';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import {
  createBindingTemplate,
  newSubject,
  DEFAULT_APIGROUP,
} from './templates';
import { SingleSubjectForm, SingleSubjectInput } from './SubjectForm';
import { validateBinding } from './helpers';
import { RoleForm } from './RoleForm';
import { useHasPermissionsFor } from 'hooks/useHasPermissionsFor';

export function GenericRoleBindingCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialRoleBinding,
  resourceUrl,
  pluralKind,
  singularName,
  ...props
}) {
  const { t } = useTranslation();
  const [hasPermissionsForClusterRoles] = useHasPermissionsFor([
    [DEFAULT_APIGROUP, 'clusterroles'],
  ]);

  const [binding, setBinding] = useState(
    cloneDeep(initialRoleBinding) || createBindingTemplate(namespace),
  );

  React.useEffect(() => {
    setCustomValid(validateBinding(binding));
  }, [binding, setCustomValid]);

  const rolesUrl = `/apis/${DEFAULT_APIGROUP}/v1/namespaces/${namespace}/roles`;
  const {
    data: roles,
    loading: namespaceRolesLoading = true,
    error: namespaceRolesError,
  } = useGetList()(rolesUrl, { skip: !namespace });

  const clusterRolesUrl = `/apis/${DEFAULT_APIGROUP}/v1/clusterroles`;
  let {
    data: clusterRoles,
    loading: clusterRolesLoading = true,
    error: clusterRolesError,
  } = useGetList()(clusterRolesUrl, {
    skip: !hasPermissionsForClusterRoles,
  });

  // ignore no permissions for ClusterRoles
  if (clusterRolesError?.code === 403) {
    clusterRoles = [];
    clusterRolesError = null;
  }

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
      apiGroup: DEFAULT_APIGROUP,
    };
    jp.value(binding, '$.roleRef', newRole);
    setBinding({ ...binding });
  };

  return (
    <ResourceForm
      {...props}
      pluralKind={pluralKind}
      singularName={singularName}
      resource={binding}
      setResource={setBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      initialResource={initialRoleBinding}
      nameProps={{ pattern: '.*', showHelp: false }}
      handleNameChange={name => {
        jp.value(binding, '$.metadata.name', name);

        setBinding({ ...binding });
      }}
    >
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

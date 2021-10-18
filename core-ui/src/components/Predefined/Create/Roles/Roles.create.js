import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  createRoleTemplate,
  createClusterRoleTemplate,
  createRuleTemplate,
  validateRole,
} from './helpers';
import { useMicrofrontendContext } from 'react-shared';
import { RuleInput } from './RuleInput';

export function RolesCreate(props) {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="roles"
      singularName={t('roles.name_singular')}
      createUrl={`/apis/rbac.authorization.k8s.io/v1/namespaces/${namespace}/roles/`}
      createTemplate={() => createRoleTemplate(namespace)}
    />
  );
}
export function ClusterRolesCreate(props) {
  const { t } = useTranslation();
  return (
    <GenericRoleCreate
      {...props}
      pluralKind="clusterroles"
      singularName={t('cluster-roles.name_singular')}
      createUrl={`/apis/rbac.authorization.k8s.io/v1/clusterroles/`}
      createTemplate={createClusterRoleTemplate}
    />
  );
}

function GenericRoleCreate({
  onChange,
  formElementRef,
  setCustomValid,
  pluralKind,
  singularName,
  createUrl,
  createTemplate,
}) {
  const { t } = useTranslation();
  const [role, setRole] = useState(createTemplate());

  useEffect(() => {
    setCustomValid(validateRole(role));
  }, [role, setRole, setCustomValid]);

  return (
    <ResourceForm
      pluralKind={pluralKind}
      singularName={singularName}
      resource={role}
      setResource={setRole}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={createUrl}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('roles.name_singular')}
        setValue={name => {
          jp.value(role, '$.metadata.name', name);
          jp.value(role, "$.metadata.labels['app.kubernetes.io/name']", name);
          setRole({ ...role });
        }}
      />

      <ResourceForm.ItemArray
        propertyPath="$.rules"
        listTitle={t('roles.headers.rules')}
        nameSingular={t('roles.headers.rule')}
        itemRenderer={(current, allValues, setAllValues, isAdvanced) => (
          <RuleInput
            rule={current}
            rules={allValues}
            setRules={setAllValues}
            isAdvanced={isAdvanced}
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
        defaultOpen
      />
    </ResourceForm>
  );
}

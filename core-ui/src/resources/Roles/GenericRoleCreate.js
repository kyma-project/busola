import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import {
  K8sNameField,
  KeyValueField,
  ItemArray,
} from 'shared/ResourceForm/fields';
import { createRuleTemplate, validateRole } from './helpers';
import { RuleInput } from './RuleInput';
import { RuleTitle } from './RuleTitle';

export function GenericRoleCreate({
  onChange,
  formElementRef,
  setCustomValid,
  pluralKind,
  singularName,
  resourceUrl,
  presets,
  createTemplate,
  resource: initialRole,
  ...props
}) {
  const { t } = useTranslation();
  const [role, setRole] = useState(cloneDeep(initialRole) || createTemplate());

  useEffect(() => {
    setCustomValid(validateRole(role));
  }, [role, setRole, setCustomValid]);

  return (
    <ResourceForm
      {...props}
      pluralKind={pluralKind}
      singularName={singularName}
      resource={role}
      initialResource={initialRole}
      setResource={setRole}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      presets={!initialRole && presets}
    >
      <K8sNameField
        required
        readOnly={!!initialRole?.metadata?.name}
        propertyPath="$.metadata.name"
        kind={t('roles.name_singular')}
        setValue={name => {
          jp.value(role, '$.metadata.name', name);
          jp.value(role, "$.metadata.labels['app.kubernetes.io/name']", name);
          setRole({ ...role });
        }}
        validate={value => !!value}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ItemArray
        propertyPath="$.rules"
        listTitle={t('roles.headers.rules')}
        entryTitle={(rule, i) => <RuleTitle rule={rule} i={i} />}
        nameSingular={t('roles.headers.rule')}
        itemRenderer={({ item, values, setValues, isAdvanced }) => (
          <RuleInput
            rule={item}
            rules={values}
            setRules={setValues}
            isAdvanced={isAdvanced}
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
        defaultOpen
      />
    </ResourceForm>
  );
}

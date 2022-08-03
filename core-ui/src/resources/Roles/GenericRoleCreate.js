import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { ItemArray } from 'shared/ResourceForm/fields';
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
      defaultFieldsProps={{
        name: {
          readOnly: !!initialRole?.metadata?.name,
        },
      }}
    >
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

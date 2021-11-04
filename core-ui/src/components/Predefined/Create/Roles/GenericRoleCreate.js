import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { createRuleTemplate, validateRole } from './helpers';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { RuleInput } from './RuleInput';
import { RuleTitle } from './RuleTitle';
import { useResourcesForApiGroups } from './useResourcesForApiGroups';

export function GenericRoleCreate({
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

  // dictionary of pairs (apiGroup: resources in that apiGroup)
  const resourcesCache = useResourcesForApiGroups(
    role?.rules?.flatMap(r => r.apiGroups),
  );

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
      <ResourceForm.FormField
        required
        label={t('common.labels.name')}
        placeholder={t('components.k8s-name-input.placeholder', {
          resourceType: t('roles.name_singular'),
        })}
        input={Inputs.Text}
        propertyPath="$.metadata.name"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.ItemArray
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
            resourcesCache={resourcesCache}
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
        defaultOpen
      />
    </ResourceForm>
  );
}

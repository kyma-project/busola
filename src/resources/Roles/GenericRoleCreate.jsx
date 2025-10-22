import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { ItemArray } from 'shared/ResourceForm/fields';
import { createRuleTemplate, validateRole } from './helpers';
import { RuleInput } from './RuleInput';
import { RuleTitle } from './RuleTitle';
import { getDescription, SchemaContext } from 'shared/helpers/schema';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useAtomValue } from 'jotai';

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
  const [initialResource, setInitialResource] = useState(
    initialRole || createTemplate(),
  );
  const layoutState = useAtomValue(columnLayoutAtom);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    setRole(cloneDeep(initialRole) || createTemplate());
    setInitialResource(initialRole || createTemplate());
  }, [initialRole, createTemplate, layoutState?.showEdit?.resource]);

  const isEdit = useMemo(
    () =>
      !!initialResource?.metadata?.uid && !layoutState?.showCreate?.resource,
    [initialResource, layoutState?.showCreate?.resource],
  );

  useEffect(() => {
    setCustomValid(validateRole(role));
  }, [role, setRole, setCustomValid]);

  const schema = useContext(SchemaContext);
  const rulesDesc = getDescription(schema, 'rules');

  return (
    <ResourceForm
      {...props}
      pluralKind={pluralKind}
      singularName={singularName}
      resource={role}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setRole}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      presets={!isEdit && presets}
      nameProps={{ readOnly: !!initialRole?.metadata?.name }}
    >
      <ItemArray
        propertyPath="$.rules"
        listTitle={t('roles.headers.rules')}
        entryTitle={(rule, i) => <RuleTitle rule={rule} i={i} />}
        nameSingular={t('roles.headers.rule')}
        tooltipContent={t(rulesDesc, { defaultValue: rulesDesc })}
        itemRenderer={({ item, values, setValues }) => (
          <RuleInput
            rule={item}
            rules={values}
            setRules={setValues}
            schema={schema}
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
        defaultOpen
      />
    </ResourceForm>
  );
}

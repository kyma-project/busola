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

interface GenericRoleCreateProps {
  onChange: () => void;
  formElementRef: React.RefObject<HTMLFormElement>;
  setCustomValid: (valid: boolean) => void;
  pluralKind: string;
  singularName: string;
  resourceUrl: string;
  presets: any;
  createTemplate: () => any;
  resource: any;
  [key: string]: any;
}

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
}: GenericRoleCreateProps) {
  const { t } = useTranslation();
  const [role, setRole] = useState(cloneDeep(initialRole) || createTemplate());
  const [initialResource, setInitialResource] = useState(
    initialRole || createTemplate(),
  );
  const layoutState = useAtomValue(columnLayoutAtom);

  useEffect(() => {
    if (layoutState?.showEdit?.resource) return;

    const timeoutId = setTimeout(() => {
      setRole(cloneDeep(initialRole) || createTemplate());
      setInitialResource(initialRole || createTemplate());
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
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
        {...({
          propertyPath: '$.rules',
          defaultOpen: true,
        } as any)}
        listTitle={t('roles.headers.rules')}
        entryTitle={(rule: any, i: number) => <RuleTitle rule={rule} i={i} />}
        nameSingular={t('roles.headers.rule')}
        tooltipContent={t(rulesDesc as string, {
          defaultValue: rulesDesc as string,
        })}
        itemRenderer={({ item, values, setValues }: any) => (
          <RuleInput
            rule={item}
            rules={values}
            setRules={setValues}
            schema={schema}
          />
        )}
        newResourceTemplateFn={createRuleTemplate}
      />
    </ResourceForm>
  );
}

import { useContext, useEffect, useState } from 'react';
import { WidgetPluginProps } from '@ui-schema/react';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { TriggerContext } from '../contexts/Trigger';
import { Resource } from '../contexts/DataSources';

type VisibilityHandlerProps = {
  value: any;
  resource: Resource;
  onChange: (action: Record<string, any>) => void;
} & WidgetPluginProps;

export function VisibilityHandler({
  value,
  schema,
  storeKeys,
  Next,
  resource,
  onChange,
  required,
  ...props
}: VisibilityHandlerProps) {
  const triggers = useContext(TriggerContext);
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  // rule.visibility won't work for "var", we must use schema.get('visibility')
  const visibilityFormula = schema.get('visibility');
  const overwrite = schema.get('overwrite') ?? true;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const setVisibility = async () => {
      if (triggers.enabled) {
        if (visibilityFormula) {
          const [result] = await jsonata(
            visibilityFormula,
            itemVars(resource, rule?.itemVars, storeKeys),
          );
          setVisible(result as any);
        } else if (visibilityFormula === false) {
          setVisible(false);
        }
      }
    };
    setVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    triggers.enabled,
    visibilityFormula,
    rule?.itemVars,
    storeKeys,
    resource,
    value,
    overwrite,
    schema,
    storeKeys,
    resource,
    onChange,
    required,
    jsonata,
  ]);

  if (!visible && value && overwrite) {
    onChange({
      storeKeys,
      scopes: ['value'],
      type: 'set',
      schema,
      required,
      data: {},
    });
  }

  if (!visible) {
    return null;
  }

  return (
    <Next.Component
      {...props}
      schema={schema}
      storeKeys={storeKeys}
      resource={resource}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

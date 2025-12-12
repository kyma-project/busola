import { useContext, useEffect, useState } from 'react';
import { getNextPlugin } from '@ui-schema/ui-schema/PluginStack';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { TriggerContext } from '../contexts/Trigger';

export function VisibilityHandler({
  value,
  schema,
  storeKeys,
  currentPluginIndex,
  resource,
  onChange,
  required,
  ...props
}) {
  const triggers = useContext(TriggerContext);
  const { itemVars } = useVariables();
  const jsonata = useJsonata({ resource });

  const rule = schema.get('schemaRule');

  // rule.visibility won't work for "var", we must use schema.get('visibility')
  const visibilityFormula = schema.get('visibility');
  const overwrite = schema.get('overwrite') ?? true;
  const [visible, setVisible] = useState(true);

  const setVisibility = async () => {
    if (triggers.enabled) {
      if (visibilityFormula) {
        const [result] = await jsonata(
          visibilityFormula,
          itemVars(resource, rule?.itemVars, storeKeys),
        );
        setVisible(result);
      } else if (visibilityFormula === false) {
        setVisible(false);
      }
    }
  };

  useEffect(() => {
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
    currentPluginIndex,
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

  const nextPluginIndex = currentPluginIndex + 1;
  const Plugin = getNextPlugin(nextPluginIndex, props.widgets);

  return (
    <Plugin
      {...props}
      currentPluginIndex={nextPluginIndex}
      schema={schema}
      storeKeys={storeKeys}
      resource={resource}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}

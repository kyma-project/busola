import React from 'react';
import { MessageStrip } from 'fundamental-react';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';

export function AlertRenderer({
  value,
  schema,
  storeKeys,
  compact,
  originalResource,
  resource,
  singleRootResource,
  embedResource,
  ...props
}) {
  const { itemVars } = useVariables();

  const rule = schema.get('schemaRule');
  const item = itemVars(resource, rule.itemVars, storeKeys);

  const jsonata = useJsonata({
    resource: originalResource,
    parent: resource,
    embedResource: embedResource,
    scope: value,
    value,
  });
  const alert = schema.get('alert');
  const schemaType = schema.get('severity') || 'information';

  function alertJsonata(alertFormula, item) {
    const [value, error] = jsonata(alertFormula, item);
    if (error) {
      console.warn('Widget::shouldBeVisible error:', error);
      return error.message;
    } else {
      return value;
    }
  }
  const alertLink = useCreateResourceDescription(alertJsonata(alert, item));
  return (
    <MessageStrip type={schemaType} className="fd-margin-top--sm">
      {alertLink}
    </MessageStrip>
  );
}

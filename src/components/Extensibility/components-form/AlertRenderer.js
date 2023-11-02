import React from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';

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
  const severity = schema.get('severity');

  let schemaType = 'Information';
  if (severity === 'warning') {
    schemaType = 'Warning';
  } else if (severity === 'error') {
    schemaType = 'Negative';
  } else if (severity === 'success') {
    schemaType = 'Positive';
  }

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
    <MessageStrip
      design={schemaType}
      hideCloseButton
      className="bsl-margin-top--sm"
    >
      {alertLink}
    </MessageStrip>
  );
}

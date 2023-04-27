import React from 'react';
import { MessageStrip } from 'fundamental-react';

import { useGetTranslation } from 'components/Extensibility/helpers';

import { useJsonata } from '../hooks/useJsonata';

export function AlertRenderer({
  value,
  schema,
  storeKeys,
  compact,
  originalResource,
  singleRootResource,
  embedResource,
  ...props
}) {
  const { t: tExt } = useGetTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope: value,
    value,
  });
  const alert = schema.get('alert');
  const schemaType = schema.get('severity') || 'information';

  function alertJsonata(alertFormula) {
    const [value, error] = jsonata(alertFormula);

    if (error) {
      console.warn('Widget::shouldBeVisible error:', error);
      return error.message;
    } else {
      return value;
    }
  }

  return (
    <MessageStrip type={schemaType} className="fd-margin-top--sm">
      {tExt(alertJsonata(alert))}
    </MessageStrip>
  );
}

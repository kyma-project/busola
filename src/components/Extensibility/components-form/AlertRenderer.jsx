import { useEffect, useMemo, useState } from 'react';
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
  const item = itemVars(resource, rule?.itemVars, storeKeys);
  const stableJsonataDeps = useMemo(
    () => ({
      resource: originalResource,
      parent: resource,
      embedResource: embedResource,
      scope: value,
      value,
    }),
    [originalResource, resource, embedResource, value],
  );
  const jsonata = useJsonata(stableJsonataDeps);
  const alert = schema.get('alert');
  const severity = schema.get('severity');

  let schemaType = 'Information';
  if (severity === 'warning') {
    schemaType = 'Critical';
  } else if (severity === 'error') {
    schemaType = 'Negative';
  } else if (severity === 'success') {
    schemaType = 'Positive';
  }

  const [alertJsonata, setAlertJsonata] = useState('');

  useEffect(() => {
    async function getAlertJsonata(alertFormula, item) {
      const [value, error] = await jsonata(alertFormula, item);
      if (error) {
        console.warn('Widget::shouldBeVisible error:', error);
        return error.message;
      } else {
        return value;
      }
    }
    getAlertJsonata(alert, item).then((res) => setAlertJsonata(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, item, stableJsonataDeps]);

  const alertLink = useCreateResourceDescription(alertJsonata);
  return (
    <MessageStrip
      design={schemaType}
      hideCloseButton
      className="sap-margin-y-tiny"
    >
      {alertLink}
    </MessageStrip>
  );
}

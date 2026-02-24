import { useEffect, useMemo, useState } from 'react';
import { MessageStrip } from '@ui5/webcomponents-react';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

import { useVariables } from '../hooks/useVariables';
import { useJsonata } from '../hooks/useJsonata';
import { StoreKeys, StoreSchemaType } from '@ui-schema/ui-schema';
import MessageStripDesign from '@ui5/webcomponents/dist/types/MessageStripDesign';
import { Resource } from '../contexts/DataSources';

type AlertRendererProps = {
  value: any;
  schema: StoreSchemaType;
  storeKeys: StoreKeys;
  originalResource: Resource;
  resource?: Resource;
  embedResource?: Resource;
};

const getMessageType = (
  severity: string,
): MessageStripDesign | keyof typeof MessageStripDesign => {
  switch (severity) {
    case 'warning':
      return 'Critical';
    case 'error':
      return 'Negative';
    case 'success':
      return 'Positive';
    default:
      return 'Information';
  }
};

export function AlertRenderer({
  value,
  schema,
  storeKeys,
  originalResource,
  resource,
  embedResource,
}: AlertRendererProps) {
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

  const schemaType = getMessageType(severity);

  const [alertJsonata, setAlertJsonata] = useState<string | null>('');

  useEffect(() => {
    async function getAlertJsonata(
      alertFormula: string,
      item: Record<string, any>,
    ) {
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

import React from 'react';

import { useGetTranslation } from 'components/Extensibility/helpers';
import { MessageStrip } from 'fundamental-react';

export function AlertRenderer({ value, schema, storeKeys, compact, ...props }) {
  const { t: tExt } = useGetTranslation();
  const alert = schema.get('message');
  const alertFormula = schema.get('alertFormula');
  const schemaType = schema.get('type') || 'information';

  return (
    <MessageStrip type={schemaType}>{alertFormula || tExt(alert)}</MessageStrip>
  );
}

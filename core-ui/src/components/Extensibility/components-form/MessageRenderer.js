import React from 'react';

import { useGetTranslation } from 'components/Extensibility/helpers';
import { MessageStrip } from 'fundamental-react';

export function MessageRenderer({
  value,
  schema,
  storeKeys,
  compact,
  ...props
}) {
  console.log('first');
  const { t: tExt } = useGetTranslation();
  const message = schema.get('message');
  const schemaType = schema.get('type') || 'information';

  return <MessageStrip type={schemaType}>{tExt(message)}</MessageStrip>;
}

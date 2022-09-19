import React from 'react';

import { useGetTranslation } from 'components/Extensibility/helpers';
import { MessageStrip } from 'fundamental-react';

export function MessageRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  compact,
  ...props
}) {
  console.log('first');
  const { t: tExt } = useGetTranslation();
  const message = schema.get('message');

  return <MessageStrip>{tExt(message)}</MessageStrip>;
}

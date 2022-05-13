import React from 'react';
import { Trans } from '@ui-schema/ui-schema';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
}) {
  return (
    <>
      <Trans text={storeKeys.join('.')} />
      <input
        onKeyDown={onKeyDown}
        onChange={e => {
          const newVal = e.target.value;

          onChange({
            storeKeys,
            scopes: ['value'],
            type: 'set',
            schema,
            required,
            data: { value: newVal },
          });
        }}
        value={value}
      />
    </>
  );
}

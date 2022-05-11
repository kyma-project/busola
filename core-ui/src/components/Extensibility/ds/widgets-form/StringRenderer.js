import React from 'react';

export function StringRenderer({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
}) {
  return (
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
  );
}

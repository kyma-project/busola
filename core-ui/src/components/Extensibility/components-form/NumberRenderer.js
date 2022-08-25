import React from 'react';
import { memo } from '@ui-schema/ui-schema';
import { extractValue } from '@ui-schema/ui-schema/UIStore';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function NumberRendererCore({
  onChange,
  onKeyDown,
  value,
  schema,
  storeKeys,
  required,
  compact,
  placeholder,
  ...props
}) {
  const { tFromStoreKeys, t: tExt } = useGetTranslation();

  const schemaPlaceholder = schema.get('placeholder');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        onChange({
          storeKeys,
          scopes: ['value'],
          type: 'set',
          schema,
          required,
          data: { value },
        });
      }}
      label={tFromStoreKeys(storeKeys, schema)}
      placeholder={schemaPlaceholder ? tExt(schemaPlaceholder) : placeholder}
      data-testid={storeKeys.join('.')}
      input={Inputs.Number}
      compact={compact}
      required={required}
    />
  );
}

export const NumberRenderer = extractValue(memo(NumberRendererCore));

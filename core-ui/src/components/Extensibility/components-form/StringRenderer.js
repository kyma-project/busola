import React from 'react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { useGetTranslation } from 'components/Extensibility/helpers';

export function StringRenderer({
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

  const getTypeSpecificProps = () => {
    if (schema.get('enum')) {
      const options = schema.toJS().enum.map(key => ({ key, text: key }));
      return { input: Inputs.ComboboxInput, options };
    } else {
      return { input: Inputs.Text };
    }
  };

  const getRemainingProps = () => {
    const jsSchema = schema.toJS() || {};
    const {
      placeholder: schemaPlaceholder,
      required: schemaRequired,
      showInfo,
      tooltip: tooltipContent,
    } = jsSchema;

    return {
      schemaPlaceholder,
      required: schemaRequired ?? required,
      showInfo,
      tooltipContent,
    };
  };

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
      compact={compact}
      data-testid={storeKeys.join('.')}
      {...getTypeSpecificProps()}
      {...getRemainingProps()}
    />
  );
}

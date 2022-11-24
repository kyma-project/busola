import React from 'react';
import { Icon, InputGroup, FormInput } from 'fundamental-react';

import { useValidation } from 'shared/hooks/useValidation';
import { ResourceForm } from 'shared/ResourceForm';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function JsonataInput({
  value,
  setValue,
  onChange,
  inputRef,
  validationRef,
  internalValue,
  setMultiValue,
  setResource,
  validateMessage,
  fullWidth,
  ...props
}) {
  const validationProps = useValidation({
    inputRef,
    onChange: [onChange, e => setValue && setValue(e.target.value)],
  });

  return (
    <div className="fd-col fd-col-md--11">
      <InputGroup compact>
        <InputGroup.Addon>
          <Tooltip content="jsonata">
            <Icon ariaLabel="Jsonata" glyph="source-code" />
          </Tooltip>
        </InputGroup.Addon>
        <FormInput
          compact
          value={value || ''}
          {...props}
          {...validationProps}
        />
      </InputGroup>
    </div>
  );
}

export function Jsonata({
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
  const { tFromStoreKeys, t: tExt, exists } = useGetTranslation();
  const schemaPlaceholder = schema.get('placeholder');

  return (
    <ResourceForm.FormField
      value={value}
      setValue={value => {
        onChange &&
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
      placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
      input={JsonataInput}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}

import { useValidation } from 'shared/hooks/useValidation';
import { ResourceForm } from 'shared/ResourceForm';
import {
  useGetTranslation,
  getPropsFromSchema,
} from 'components/Extensibility/helpers';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Icon, Input } from '@ui5/webcomponents-react';

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
  if (!props.readOnly) delete props.readOnly;

  return (
    <div className="bsl-col-md--11">
      <Tooltip content="jsonata" position="bottom">
        <Input
          value={value || ''}
          {...props}
          {...validationProps}
          onInput={onChange ?? (e => setValue && setValue(e.target.value))}
          icon={<Icon aria-label="Jsonata" name="source-code" />}
        />
      </Tooltip>
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
  const { tFromStoreKeys, t: tExt } = useGetTranslation();
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
      data-testid={storeKeys.join('.') || tFromStoreKeys(storeKeys, schema)}
      placeholder={tExt(schemaPlaceholder) || tExt(placeholder)}
      input={JsonataInput}
      {...getPropsFromSchema(schema, required, tExt)}
    />
  );
}

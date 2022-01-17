import React from 'react';
import { FormInput } from 'fundamental-react';

import { MultiInput } from './MultiInput';

import './TextArrayInput.scss';

export function TextArrayInput({
  defaultOpen,
  inputProps: _inputProps,
  sectionTooltipContent,
  placeholder,
  toInternal = value => value || [],
  toExternal = value => value.filter(val => typeof val === 'string'),
  readOnly,
  customFormatFn,
  ...props
}) {
  const { validate, ...inputProps } = _inputProps;
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      sectionTooltipContent={sectionTooltipContent}
      readOnly={readOnly}
      inputs={[
        ({
          value,
          setValue,
          ref,
          updateValue,
          focus,
          index,
          internalValue,
          setMultiValue,
        }) => (
          <FormInput
            placeholder={Math.abs(index) === 1 ? placeholder : ''}
            key={index}
            compact
            value={value || ''}
            ref={ref}
            onChange={e => {
              setValue(e.target.value);
              updateValue();
            }}
            onKeyDown={e => focus(e)}
            onBlur={() => {
              const fieldValue = internalValue?.filter(val => !!val);
              setMultiValue(
                typeof customFormatFn === 'function'
                  ? customFormatFn(fieldValue)
                  : fieldValue,
              );
            }}
            readOnly={readOnly}
            {...inputProps}
          />
        ),
      ]}
      {...props}
    />
  );
}

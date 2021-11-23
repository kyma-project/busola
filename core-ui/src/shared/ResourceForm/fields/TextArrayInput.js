import React from 'react';
import { FormInput } from 'fundamental-react';

import { MultiInput } from './MultiInput';

export function TextArrayInput({
  defaultOpen,
  inputProps,
  sectionTooltipContent,
  placeholder,
  toInternal = value => value || [],
  toExternal = value => value.filter(val => !!val),
  readOnly,
  ...props
}) {
  return (
    <MultiInput
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      sectionTooltipContent={sectionTooltipContent}
      readOnly={readOnly}
      inputs={[
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <FormInput
            placeholder={Math.abs(index) === 1 ? placeholder : ''}
            key={index}
            compact
            value={value || ''}
            ref={ref}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => focus(e)}
            onBlur={onBlur}
            readOnly={readOnly}
            {...inputProps}
          />
        ),
      ]}
      {...props}
    />
  );
}

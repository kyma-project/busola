import React from 'react';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

export function SelectArrayInput({
  title,
  defaultOpen,
  placeholder,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  options,
  ...props
}) {
  const toInternal = values => (values || []).filter(v => v);

  const toExternal = values => values.filter(val => !!val);

  return (
    <MultiInput
      title={title}
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, updateValue, focus, index }) => (
          <Inputs.Dropdown
            key={index}
            placeholder={placeholder}
            _ref={ref}
            value={value}
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={updateValue}
            className="bsl-margin-end--sm"
          />
        ),
      ]}
      {...props}
    />
  );
}

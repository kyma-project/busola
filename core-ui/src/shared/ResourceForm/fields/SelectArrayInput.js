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
        ({ value, setValue, ref, onBlur, focus, index }) => (
          <Inputs.Dropdown
            key={index}
            placeholder={placeholder}
            compact
            _ref={ref}
            value={value}
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={onBlur}
            className="fd-margin-end--sm"
          />
        ),
      ]}
      {...props}
    />
  );
}

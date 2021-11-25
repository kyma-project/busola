import React from 'react';
import { useTranslation } from 'react-i18next';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

export function ComboboxArrayInput({
  title,
  defaultOpen,
  placeholder,
  inputProps,
  isAdvanced,
  tooltipContent,
  sectionTooltipContent,
  options,
  emptyStringKey,
  ...props
}) {
  const { t } = useTranslation();

  placeholder =
    placeholder || t('common.messages.type-to-select', { value: title });

  /*
    as original Combobox (and React's 'input' element) doesn't like '' for a key,
    we replace it with 'emptyStringKey' internal MultiInput state

    {key: '', text: 'empty'} -> {key: emptyStringKey, text: 'empty'}
  */
  const toInternal = values =>
    (values || [])
      .filter(v => v || (emptyStringKey && v === ''))
      .map(v => (emptyStringKey && v === '' ? emptyStringKey : v));

  const toExternal = values =>
    values
      .filter(val => !!val)
      .map(v => (emptyStringKey && v === emptyStringKey ? '' : v));

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
          <Inputs.ComboboxInput
            key={index}
            placeholder={placeholder}
            compact
            _ref={ref}
            selectedKey={value}
            typedValue={value || ''}
            selectionType="manual"
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={onBlur}
          />
        ),
      ]}
      {...props}
    />
  );
}

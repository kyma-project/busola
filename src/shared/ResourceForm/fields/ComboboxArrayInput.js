import React from 'react';
import { useTranslation } from 'react-i18next';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';
import './ComboboxArrayInput.scss';

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
  onBlur,
  filterOptions,
  noEdit,
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
      noEdit={noEdit}
      defaultOpen={defaultOpen}
      isAdvanced={isAdvanced}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      className="combobox-array-input"
      inputs={[
        ({
          value,
          internalValue,
          setValue,
          ref,
          updateValue,
          focus,
          index,
        }) => {
          const filteredOptions = () => {
            if (!filterOptions) return options;
            return options.filter(
              option => !internalValue.includes(option.key),
            );
          };
          return (
            <Inputs.ComboboxInput
              key={index}
              placeholder={placeholder}
              compact
              _ref={ref}
              selectedKey={value}
              typedValue={value || ''}
              selectionType="manual"
              setValue={setValue}
              options={filteredOptions()}
              onKeyDown={focus}
              onBlur={onBlur}
              fullWidth
              onSelectionChange={(_, selected) => {
                if ((noEdit && !selected) || selected.key === -1) {
                  return;
                }
                if (!selected.text) {
                  setValue(null);
                  updateValue(null);
                }
                const selection =
                  selected.key !== -1 ? selected.key : selected.text;
                setValue(selection);
                updateValue(selection);
              }}
            />
          );
        },
      ]}
      {...props}
    />
  );
}

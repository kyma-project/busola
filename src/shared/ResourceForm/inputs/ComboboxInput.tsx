import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import type { ComboBoxDomRef, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { Ref } from 'react';

type Option = {
  key: string | number;
  text: string | number;
};

type ComboboxInputProps = {
  value?: string | number;
  setValue?: (key: string | number) => void;
  selectedKey?: string | number;
  options: Option[];
  id?: string;
  updatesOnInput?: boolean;
  placeholder?: string;
  className?: string;
  _ref?: Ref<ComboBoxDomRef>;
  onSelectionChange?: (
    event: Ui5CustomEvent<ComboBoxDomRef>,
    option: Option,
  ) => void;
  accessibleName?: string;
  isNumeric?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

export function ComboboxInput({
  value,
  setValue,
  selectedKey,
  options,
  id,
  updatesOnInput = true,
  placeholder,
  className,
  _ref,
  onSelectionChange,
  accessibleName,
  isNumeric,
  disabled,
  ...props
}: ComboboxInputProps) {
  const onChange = (event: Ui5CustomEvent<ComboBoxDomRef>) => {
    const target = event.target as ComboBoxDomRef & {
      _state: { filterValue: string };
    };
    let selectedOption: Option;
    if (!isNumeric) {
      selectedOption = options.find((o) => o.text === target.value) ?? {
        key: target._state.filterValue,
        text: target._state.filterValue,
      };
    } else {
      const newValue = Number(target.value);
      const filterValue = Number(target._state.filterValue);
      if (isNaN(newValue) && isNaN(filterValue)) {
        return;
      }

      selectedOption = options.find((o) => o.text === newValue) ?? {
        key: filterValue,
        text: filterValue,
      };
    }
    if (onSelectionChange) {
      onSelectionChange(event, selectedOption);
    } else {
      setValue?.(selectedOption.key);
    }
  };

  return (
    <ComboBox
      className={className}
      accessibleName={`${accessibleName} Combobox input`}
      id={id || 'combobox-input'}
      ref={_ref}
      disabled={disabled || !options?.length}
      filter="Contains"
      onChange={onChange}
      onInput={updatesOnInput ? onChange : () => {}}
      value={
        options
          .find((o) => o.key === value || o.key === selectedKey)
          ?.text?.toString() ?? value?.toString()
      }
      placeholder={placeholder}
      {...props}
    >
      {options.map((option, index) => (
        <ComboBoxItem
          key={index}
          id={String(option.key)}
          text={String(option.text)}
        />
      ))}
    </ComboBox>
  );
}

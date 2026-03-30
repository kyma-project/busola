import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import type { ComboBoxDomRef } from '@ui5/webcomponents-react';
import { Ref, SyntheticEvent } from 'react';

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
  onSelectionChange?: (event: SyntheticEvent, option: Option) => void;
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
  ...props
}: ComboboxInputProps) {
  const onChange = (event: any) => {
    let selectedOption: Option;
    if (!props?.isNumeric) {
      selectedOption = options.find((o) => o.text === event.target.value) ?? {
        key: event.target._state.filterValue,
        text: event.target._state.filterValue,
      };
    } else {
      const newValue = Number(event.target.value);
      const filterValue = Number(event.target._state.filterValue);
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
      disabled={props.disabled || !options?.length}
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

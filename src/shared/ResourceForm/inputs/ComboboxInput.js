import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';

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
  fullWidth,
  accessibleName,
  ...props
}) {
  const onChange = event => {
    let selectedOption;
    if (!props?.isNumeric) {
      selectedOption = options.find(o => o.text === event.target.value) ?? {
        key: event.target._state.filterValue,
        text: event.target._state.filterValue,
      };
    } else {
      const newValue = Number(event.target.value);
      const filterValue = Number(event.target._state.filterValue);
      if (isNaN(newValue) && isNaN(filterValue)) {
        return;
      }

      selectedOption = options.find(o => o.text === newValue) ?? {
        key: filterValue,
        text: filterValue,
      };
    }
    if (onSelectionChange) {
      onSelectionChange(event, selectedOption);
    } else {
      setValue(selectedOption.key);
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
        options.find(o => o.key === value || o.key === selectedKey)?.text ??
        value
      }
      placeholder={placeholder}
      {...props}
    >
      {options.map((option, index) => (
        <ComboBoxItem
          key={`${option.text}-${index}`}
          id={option.key}
          text={option.text}
        />
      ))}
    </ComboBox>
  );
}

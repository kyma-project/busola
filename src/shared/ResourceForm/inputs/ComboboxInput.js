import classnames from 'classnames';
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
  ...props
}) {
  const onChange = event => {
    const selectedOption = options.find(o => o.text === event.target.value) ?? {
      key: event.target._state.filterValue,
      text: event.target._state.filterValue,
    };
    if (onSelectionChange) {
      onSelectionChange(event, selectedOption);
    } else {
      setValue(selectedOption.key);
    }
  };

  return (
    <div
      className={classnames(
        `fd-col fd-col-md--${fullWidth ? '12' : '11'}`,
        className,
      )}
    >
      <ComboBox
        aria-label="Combobox input"
        id={id || 'combobox-input'}
        ref={_ref}
        disabled={props.disabled || !options?.length}
        filter="None"
        onChange={onChange}
        onInput={updatesOnInput ? onChange : () => {}}
        value={
          options.find(o => o.key === value || o.key === selectedKey)?.text ??
          value
        }
        placeholder={placeholder}
        {...props}
      >
        {options.map(option => (
          <ComboBoxItem id={option.key} text={option.text} />
        ))}
      </ComboBox>
    </div>
  );
}

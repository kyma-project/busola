import classnames from 'classnames';
import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';

export function ComboboxInput({
  value,
  setValue,
  selectedKey,
  options,
  id,
  placeholder,
  className,
  _ref,
  onSelectionChange,
  fullWidth,
  ...props
}) {
  return (
    <div
      className={classnames(
        `bsl-col bsl-col-md--${fullWidth ? '12' : '11'}`,
        className,
      )}
    >
      <ComboBox
        aria-label="Combobox input"
        id={id || 'combobox-input'}
        ref={_ref}
        disabled={props.disabled || !options?.length}
        filter="Contains"
        onChange={event => {
          const selectedOption = options.find(
            o => o.text === event.target.value,
          );
          if (!selectedOption) return;
          if (onSelectionChange) {
            onSelectionChange(event, selectedOption);
          } else {
            setValue(
              selectedOption.key !== -1
                ? selectedOption.key
                : selectedOption.text,
            );
          }
        }}
        value={
          options.find(o => o.key === value || o.key === selectedKey)?.text ??
          ''
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

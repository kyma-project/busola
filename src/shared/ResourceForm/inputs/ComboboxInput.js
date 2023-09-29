import classnames from 'classnames';
import {
  ComboBox as UI5ComboBox,
  ComboBoxItem,
} from '@ui5/webcomponents-react';

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
        `fd-col fd-col-md--${fullWidth ? '12' : '11'}`,
        className,
      )}
    >
      <UI5ComboBox
        ariaLabel="Combobox input"
        id={id || 'combobox-input'}
        ref={_ref}
        disabled={props.disabled || !options?.length}
        filter="Contains"
        onSelectionChange={event => {
          const selectedOption = options.find(
            // eslint-disable-next-line eqeqeq
            o => o.key == event.detail.item.id,
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
          // eslint-disable-next-line eqeqeq
          options.find(o => o.key == value || o.key == selectedKey)?.text ?? ''
        }
        placeholder={placeholder}
        {...props}
      >
        {options.map(option => (
          <ComboBoxItem id={option.key} text={option.text} />
        ))}
      </UI5ComboBox>
    </div>
  );
}

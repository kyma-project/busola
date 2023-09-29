import { ComboBox, ComboBoxItem } from '@ui5/webcomponents-react';
import { FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function Dropdown({
  label,
  options,
  selectedKey,
  onSelect,
  inlineHelp = '',
  id,
  disabled = false,
  placeholder,
  _ref,
  emptyListMessage,
  className,
  ...fdSelectProps
}) {
  if (!fdSelectProps.readOnly) delete fdSelectProps.readOnly;
  const { t } = useTranslation();
  if (!options || !options.length) {
    options = [
      {
        key: 'empty-list',
        text: emptyListMessage || t('components.dropdown.empty-list'),
      },
    ];
    selectedKey = options[0]?.key;
    disabled = true;
  }
  id = id || 'select-dropdown';

  const onSelectionChange = event => {
    const selectedOption = options.find(o => o.key === event.detail.item.id);
    if (selectedOption) onSelect(event, selectedOption);
  };

  const combobox = (
    <ComboBox
      className={className}
      id={id}
      data-testid={id}
      aria-label={label}
      placeholder={placeholder || label}
      disabled={disabled || !options?.length}
      onKeyDown={event => {
        event.preventDefault();
      }}
      onSelectionChange={onSelectionChange}
      value={options.find(o => o.key === selectedKey)?.text}
      ref={_ref}
      {...fdSelectProps}
    >
      {options.map(option => (
        <ComboBoxItem id={option.key} text={option.text} />
      ))}
    </ComboBox>
  );

  return (
    <div>
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      {inlineHelp ? (
        <Tooltip content={inlineHelp}>{combobox}</Tooltip>
      ) : (
        combobox
      )}
    </div>
  );
}

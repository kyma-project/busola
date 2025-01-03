import { ComboBox, ComboBoxItem, FlexBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { Label } from '../../../shared/ResourceForm/components/Label';
import { useRef } from 'react';

export function Dropdown({
  accessibleName,
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
  ...props
}) {
  if (!props.readOnly) delete props.readOnly;
  const { t } = useTranslation();
  const flexBoxRef = useRef(null);
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
      accessibleName={accessibleName || label}
      placeholder={placeholder || label}
      disabled={disabled || !options?.length}
      onKeyDown={event => {
        event.preventDefault();
      }}
      onClick={() => {
        flexBoxRef?.current
          ?.querySelector('#select-dropdown')
          ?.shadowRoot?.querySelector('ui5-icon')
          ?.click();
      }}
      onFocus={() => {
        flexBoxRef?.current
          ?.querySelector('#select-dropdown')
          ?.shadowRoot?.querySelector('input')
          ?.setAttribute('autocomplete', 'off');
      }}
      onSelectionChange={onSelectionChange}
      value={options.find(o => o.key === selectedKey)?.text}
      ref={_ref}
      {...props}
    >
      {options.map(option => (
        <ComboBoxItem key={option.key} id={option.key} text={option.text} />
      ))}
    </ComboBox>
  );

  return (
    <FlexBox
      ref={flexBoxRef}
      className="flexbox-gap full-width"
      justifyContent="Center"
      direction="Column"
    >
      {label && <Label forElement={id}>{label}</Label>}
      {inlineHelp ? (
        <Tooltip content={inlineHelp}>{combobox}</Tooltip>
      ) : (
        combobox
      )}
    </FlexBox>
  );
}

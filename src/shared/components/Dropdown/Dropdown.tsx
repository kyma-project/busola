import {
  ComboBox,
  ComboBoxDomRef,
  ComboBoxItem,
  FlexBox,
  Ui5CustomEvent,
  UI5WCSlotsNode,
} from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../ResourceForm/components/Label';
import { useRef } from 'react';
import { ComboBoxSelectionChangeEventDetail } from '@ui5/webcomponents/dist/ComboBox';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';

type DropdownProps = {
  accessibleName?: string;
  label?: string;
  options: { key: string; text: string }[];
  selectedKey: string;
  onSelect: (event: Event, option: any) => void;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  _ref?: React.RefObject<any>;
  emptyListMessage?: string;
  className?: string;
  accessibleNameRef?: string;
  name?: string;
  readonly?: boolean;
  showClearIcon?: boolean;
  valueStateMessage?: UI5WCSlotsNode;
  valueState?: ValueState | keyof typeof ValueState;
  autoFocus?: boolean;
  onOpen?: (event: Ui5CustomEvent<ComboBoxDomRef>) => void;
  onInput?: (event: Ui5CustomEvent<ComboBoxDomRef>) => void;
  [key: string]: any;
};

export function Dropdown({
  accessibleName,
  label,
  options,
  selectedKey,
  onSelect,
  required = false,
  id,
  disabled = false,
  placeholder,
  _ref,
  emptyListMessage,
  className,
  accessibleNameRef,
  name,
  readonly,
  showClearIcon,
  valueStateMessage,
  valueState,
  autoFocus,
  onOpen,
  onInput,
  ...props
}: DropdownProps) {
  const { t } = useTranslation();

  const localeRef = useRef(null);
  const comboboxRef = _ref || localeRef;

  if (!options?.length) {
    options = [
      {
        key: 'empty-list',
        text: emptyListMessage || t('components.dropdown.empty-list'),
      },
    ];
    selectedKey = options[0]?.key;
    disabled = true;
  }

  const onSelectionChange = (
    event: Ui5CustomEvent<ComboBoxDomRef, ComboBoxSelectionChangeEventDetail>,
  ) => {
    const selectedOption = options.find(
      (o) => o?.key === event?.detail?.item?.id,
    );
    if (selectedOption) onSelect(event, selectedOption);
  };

  const handlePopover = (open = false) => {
    const popover = comboboxRef?.current?.shadowRoot?.querySelector(
      'ui5-responsive-popover',
    );
    popover.open = open;
  };

  const combobox = (
    <ComboBox
      className={className}
      ref={comboboxRef}
      id={id}
      data-testid={id}
      accessibleName={accessibleName || label}
      placeholder={placeholder || label}
      disabled={disabled || !options?.length}
      required={required}
      onFocus={() => {
        comboboxRef?.current?.shadowRoot
          ?.querySelector('input')
          ?.setAttribute('autocomplete', 'off');

        handlePopover(true);
      }}
      onSelectionChange={onSelectionChange}
      onChange={() => handlePopover(false)}
      onClose={() => handlePopover(false)}
      onBlur={() => handlePopover(false)}
      value={options.find((o) => o.key === selectedKey)?.text}
      accessibleNameRef={accessibleNameRef}
      name={name}
      readonly={readonly}
      showClearIcon={showClearIcon}
      valueStateMessage={valueStateMessage}
      valueState={valueState}
      autoFocus={autoFocus}
      onOpen={onOpen}
      onInput={onInput}
      {...props}
    >
      {options.map((option) => (
        <ComboBoxItem key={option.key} id={option.key} text={option.text} />
      ))}
    </ComboBox>
  );

  return (
    <FlexBox
      className="flexbox-gap full-width"
      justifyContent="Center"
      direction="Column"
    >
      {label && <Label forElement={id}>{label}</Label>}
      {combobox}
    </FlexBox>
  );
}

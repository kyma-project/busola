import React from 'react';
import { Select, FormLabel } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { Tooltip } from '../..';
import './Dropdown.scss';

export function Dropdown({
  label,
  options,
  selectedKey,
  onSelect,
  inlineHelp = '',
  fullWidth,
  id,
  disabled = false,
  placeholder,
  _ref,
  emptyListMessage,
  i18n,
  className,
  ...fdSelectProps
}) {
  const { t } = useTranslation(null, { i18n });
  if (!options || !options.length) {
    options = [
      {
        key: 'empty-list',
        text: emptyListMessage || t('components.dropdown.empty-list'),
      },
    ];
    selectedKey = options[0].key;
    disabled = true;
  }
  id = id || 'select-dropdown';

  const select = (
    <Select
      id={id}
      data-testid={id}
      aria-label={label}
      options={options}
      selectedKey={selectedKey}
      onSelect={onSelect}
      placeholder={placeholder || label}
      disabled={disabled}
      ref={_ref}
      {...fdSelectProps}
    />
  );

  const classNames = classnames(
    'dropdown',
    {
      'dropdown--full-width': fullWidth,
    },
    className,
  );

  return (
    <div className={classNames}>
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      {inlineHelp ? <Tooltip content={inlineHelp}>{select}</Tooltip> : select}
    </div>
  );
}

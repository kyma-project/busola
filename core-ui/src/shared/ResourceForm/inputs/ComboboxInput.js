import React from 'react';
import classnames from 'classnames';
import { ComboboxInput as FundamentalComboboxInput } from 'fundamental-react';

import './ComboboxInput.scss';

export function ComboboxInput({
  value,
  setValue,
  defaultKey,
  options,
  id,
  placeholder,
  typedValue,
  className,
  _ref,
  ...props
}) {
  return (
    <div className={classnames('resource-form-combobox', className)}>
      <FundamentalComboboxInput
        ariaLabel="Combobox input"
        arrowLabel="Combobox input arrow"
        id={id || 'combobox-input'}
        compact
        ref={_ref}
        showAllEntries
        searchFullString
        selectionType="auto-inline"
        onSelectionChange={(_, selected) =>
          setValue(selected.key !== -1 ? selected.key : selected.text)
        }
        typedValue={value}
        selectedKey={value}
        placeholder={placeholder}
        options={options}
        {...props}
      />
    </div>
  );
}

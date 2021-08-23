import React from 'react';
import { Select, FormLabel } from 'fundamental-react';

import { Tooltip } from '../..';
import './Dropdown.scss';

export function Dropdown({
  label,
  options,
  selectedKey,
  onSelect,
  inlineHelp = '',
  id,
  disabled = false,
  _ref,
  emptyListMessage = 'No resources available',
  ...fdSelectProps
}) {
  if (!options || !options.length) {
    options = [
      {
        key: 'empty-list',
        text: emptyListMessage,
      },
    ];
    selectedKey = options[0].key;
    disabled = true;
  }
  id = id || 'select-dropdown';

  return (
    <div className="dropdown">
      {label && (
        <FormLabel htmlFor={id}>
          {label}
          {inlineHelp && <Tooltip content={inlineHelp} />}
        </FormLabel>
      )}
      <Select
        id={id}
        data-testid={id}
        aria-label={label}
        options={options}
        selectedKey={selectedKey}
        onSelect={onSelect}
        disabled={disabled}
        ref={_ref}
        {...fdSelectProps}
      />
    </div>
  );
}

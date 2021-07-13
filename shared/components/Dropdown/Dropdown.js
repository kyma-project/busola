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

  return (
    <div className="dropdown">
      {label && (
        <FormLabel>
          {label}
          {inlineHelp && <Tooltip isInlineHelp content={inlineHelp} />}
        </FormLabel>
      )}
      <Select
        id={id || 'select-dropdown'}
        aria-label={label}
        options={options}
        selectedKey={selectedKey}
        onSelect={onSelect}
        disabled={disabled}
        ref={_ref}
      />
    </div>
  );
}

import React from 'react';
import { FormInput } from 'fundamental-react';

import { Dropdown } from 'react-shared';

export function MemoryInput({ label, propertyPath, value = '', setValue }) {
  const units = ['K', 'Ki', 'M', 'Mi', 'G', 'Gi', 'Ti', 'T'];
  const options = [
    { key: '', text: 'B' },
    ...units.map(e => ({
      key: e,
      text: e,
    })),
  ];

  const numericValue = value.match(/^\d*(\.\d*)?/)[0];
  const unit = value.replace(numericValue, '');
  const selectedUnit = units.includes(unit) ? unit : '';

  return (
    <div className="memory-input">
      <FormInput
        compact
        type="number"
        min="0"
        required
        value={numericValue}
        onChange={e => setValue(`${e.target.value}${selectedUnit}`)}
      />
      <Dropdown
        compact
        options={options}
        selectedKey={selectedUnit}
        onSelect={(_, { key }) => setValue(`${numericValue}${key}`)}
      />
    </div>
  );
}

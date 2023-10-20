import React from 'react';

import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { Input } from '@ui5/webcomponents-react';

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
      <Input
        type="Number"
        min="0"
        required
        value={numericValue}
        onInput={e => setValue(`${e.target.value}${selectedUnit}`)}
      />
      <Dropdown
        options={options}
        selectedKey={selectedUnit}
        onSelect={(_, { key }) => setValue(`${numericValue}${key}`)}
      />
    </div>
  );
}

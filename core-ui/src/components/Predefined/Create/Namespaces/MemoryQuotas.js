import React from 'react';
import { FormItem, FormInput, FormLabel } from 'fundamental-react';
import * as jp from 'jsonpath';

import { Dropdown } from 'react-shared';

export function MemoryInput({
  label,
  propertyPath,
  container = {},
  setContainer,
}) {
  const units = ['K', 'Ki', 'M', 'Mi', 'G', 'Gi', 'Ti', 'T'];
  const options = [
    { key: '', text: 'B' },
    ...units.map(e => ({
      key: e,
      text: e,
    })),
  ];

  const value = jp.value(container, propertyPath)?.toString() || '';
  const numericValue = value.match(/^\d*(\.\d*)?/)[0];
  const unit = value.replace(numericValue, '');
  const selectedUnit = units.includes(unit) ? unit : '';

  const setValue = val => {
    jp.value(container, propertyPath, val);
    setContainer({ ...container });
  };

  return (
    <FormItem>
      <FormLabel required>{label}</FormLabel>
      <div className="memory-input">
        <FormInput
          compact
          type="number"
          min="0"
          required
          value={numericValue}
          step="any"
          onChange={e => setValue(e.target.value + selectedUnit)}
        />
        <Dropdown
          compact
          options={options}
          selectedKey={selectedUnit}
          onSelect={(_, { key }) => setValue(numericValue.toString() + key)}
        />
      </div>
    </FormItem>
  );
}

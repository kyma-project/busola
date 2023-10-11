import React from 'react';
import * as jp from 'jsonpath';

import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { Input, Form, FlexBox, Label } from '@ui5/webcomponents-react';

export function MemoryInput({
  label,
  propertyPath,
  container = {},
  setContainer,
  required,
  ...otherProps
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
  if (!otherProps.readOnly) delete otherProps.readOnly;
  return (
    <FlexBox
      direction="Column"
      style={{
        maxWidth: '100%',
      }}
    >
      <div className="memory-input">
        <Label>{label}</Label>
        <Input
          type="Number"
          min="0"
          required={required}
          value={numericValue}
          onInput={e => setValue(e.target.value + selectedUnit)}
          className="input-full"
          {...otherProps}
        />
        <Dropdown
          options={options}
          required={required}
          selectedKey={selectedUnit}
          onSelect={(_, { key }) => setValue(numericValue.toString() + key)}
          className="input-full"
          {...otherProps}
        />
      </div>
    </FlexBox>
  );
}

import React from 'react';
import { Dropdown } from 'react-shared';

export function Presets({ presets, onSelect }) {
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));

  return (
    <Dropdown
      placeholder="Select template"
      compact
      options={options}
      selectedKey={''}
      onSelect={(_, { key }) => onSelect(presets.find(p => p.name === key))}
    />
  );
}

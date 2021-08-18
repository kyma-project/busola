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
      onSelect={(e, preset) => {
        e.stopPropagation();
        onSelect(presets.find(p => p.name === preset.key));
      }}
    />
  );
}

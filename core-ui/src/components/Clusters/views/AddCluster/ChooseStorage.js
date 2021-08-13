import React from 'react';

import { FormLabel, Select } from 'fundamental-react';
import './ChooseStorage.scss';

export function ChooseStorage({ storage, setStorage }) {
  const storages = [
    { key: 'localStorage', text: 'localStorage' },
    { key: 'sessionStorage', text: 'sessionStorage' },
    { key: 'inMemory', text: 'In memory' },
  ];
  return (
    <div className="choose-storage">
      <FormLabel>Configuration storage type</FormLabel>
      <Select
        options={storages}
        selectedKey={storage}
        onSelect={(_, storage) => setStorage(storage.key)}
      />
    </div>
  );
}

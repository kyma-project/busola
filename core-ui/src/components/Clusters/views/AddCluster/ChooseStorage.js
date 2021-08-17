import React from 'react';

import { FormLabel, Select } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import './ChooseStorage.scss';

export function ChooseStorage({ storage, setStorage }) {
  const { t } = useTranslation();

  const storages = [
    { key: 'localStorage', text: 'localStorage' },
    { key: 'sessionStorage', text: 'sessionStorage' },
    { key: 'inMemory', text: t('clusters.storage.labels.inMemory') },
  ];

  return (
    <div className="choose-storage">
      <FormLabel>{t('clusters.storage.choose-storage.label')}</FormLabel>
      <Select
        options={storages}
        selectedKey={storage}
        onSelect={(_, storage) => setStorage(storage.key)}
      />
    </div>
  );
}

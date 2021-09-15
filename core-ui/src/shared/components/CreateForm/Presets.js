import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-shared';

export function Presets({ presets, onSelect }) {
  const { t, i18n } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));

  return (
    <Dropdown
      placeholder={t('common.create-form.choose-preset')}
      compact
      options={options}
      selectedKey={''}
      onSelect={(e, preset) => {
        e.stopPropagation();
        onSelect(presets.find(p => p.name === preset.key));
      }}
      i18n={i18n}
      fullWidth
    />
  );
}

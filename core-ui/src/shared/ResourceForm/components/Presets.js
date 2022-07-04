import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function Presets({ presets, onSelect, ...otherProps }) {
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
      {...otherProps}
    />
  );
}

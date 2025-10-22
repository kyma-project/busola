import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import './Presets.scss';

export function Presets({
  presets,
  onSelect,
  inlinePresets = false,
  disabled = false,
}) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));
  const label = inlinePresets ? null : t('common.create-form.template');
  const [selectedKey, setSelectedKey] = useState('');

  const presetDropdown = (
    <Dropdown
      placeholder={t('common.create-form.choose-template')} //TODO Have placeholder blank or sth
      accessibleName={t('common.create-form.template')}
      options={options}
      disabled={disabled}
      selectedKey={selectedKey}
      label={label}
      onSelect={(e, preset) => {
        e.stopPropagation();
        setSelectedKey(preset.key);
        onSelect(presets.find((p) => p.name === preset.key));
      }}
    />
  );
  return inlinePresets ? (
    presetDropdown
  ) : (
    <div className="ui5-content-density-compact preset-separator sap-margin-y-tiny">
      {presetDropdown}
    </div>
  );
}

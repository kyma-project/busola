import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormItem } from '@ui5/webcomponents-react';
import { Label } from './Label';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export type PresetProps = {
  presets: {
    name: string;
    data?: Record<string, any>;
    value?: Record<string, any> | string;
  }[];
  onSelect: (preset?: any) => void;
  inlinePresets?: boolean;
  disabled?: boolean;
};

export function Presets({
  presets,
  onSelect,
  inlinePresets = false,
  disabled = false,
}: PresetProps) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));
  const label = inlinePresets ? undefined : t('common.create-form.template');
  const [selectedKey, setSelectedKey] = useState('');

  const presetDropdown = (
    <Dropdown
      placeholder={t('common.create-form.choose-template')} //TODO Have placeholder blank or sth
      accessibleName={t('common.create-form.template')}
      options={options}
      disabled={disabled}
      selectedKey={selectedKey}
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
    <FormItem
      labelContent={
        <div className="form-field__label-box">
          <Label>{label}</Label>
        </div>
      }
    >
      {presetDropdown}
    </FormItem>
  );
}

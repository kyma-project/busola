import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';

export function Presets({ presets, onSelect, ...otherProps }) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));

  return (
    <div className="bsl-margin-bottom--xs ui5-content-density-compact">
      <Dropdown
        className="resource-form__presets"
        placeholder={t('common.create-form.choose-preset')}
        options={options}
        selectedKey={''}
        fullWidth
        onSelect={(e, preset) => {
          e.stopPropagation();
          onSelect(presets.find(p => p.name === preset.key));
        }}
        {...otherProps}
      />
    </div>
  );
}

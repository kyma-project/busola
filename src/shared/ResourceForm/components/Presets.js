import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { spacing } from '@ui5/webcomponents-react-base';

export function Presets({ presets, onSelect, ...otherProps }) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));

  return (
    <div
      className="ui5-content-density-compact"
      style={spacing.sapUiTinyMarginBottom}
    >
      <Dropdown
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

import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { spacing } from '@ui5/webcomponents-react-base';
import './Presets.scss';

export function Presets({
  presets,
  onSelect,
  inlinePresets = false,
  ...otherProps
}) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));
  const label = inlinePresets ? null : t('common.create-form.template');

  const presetDropdown = (
    <Dropdown
      placeholder={t('common.create-form.choose-template')} //TODO Have placeholder blank or sth
      options={options}
      selectedKey={''}
      fullWidth={false}
      label={label}
      onSelect={(e, preset) => {
        e.stopPropagation();
        onSelect(presets.find(p => p.name === preset.key));
      }}
      {...otherProps}
    />
  );
  return inlinePresets ? (
    presetDropdown
  ) : (
    <div
      className="ui5-content-density-compact preset-separator"
      style={{
        ...spacing.sapUiTinyMarginTopBottom,
        paddingBottom: spacing.sapUiContentPadding.padding,
      }}
    >
      {presetDropdown}
    </div>
  );
}

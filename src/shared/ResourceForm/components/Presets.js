import { useTranslation } from 'react-i18next';
import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { spacing } from '@ui5/webcomponents-react-base';
import './Presets.scss';

export function Presets({ presets, onSelect, ...otherProps }) {
  const { t } = useTranslation();
  const options = presets.map(({ name }) => ({
    key: name,
    text: name,
  }));

  return (
    <div
      className="ui5-content-density-compact preset-separator"
      style={{
        ...spacing.sapUiTinyMarginBottom,
        paddingBottom: spacing.sapUiContentPadding.padding,
      }}
    >
      <Dropdown
        placeholder={t('common.create-form.choose-preset')} //TODO Have placeholder blank or sth
        options={options}
        selectedKey={''}
        fullWidth={false}
        label={t('common.create-form.template')}
        onSelect={(e, preset) => {
          e.stopPropagation();
          onSelect(presets.find(p => p.name === preset.key));
        }}
        {...otherProps}
      />
    </div>
  );
}

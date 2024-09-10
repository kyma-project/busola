import jp from 'jsonpath';

import { Dropdown } from 'shared/components/Dropdown/Dropdown';
import { Input, FlexBox } from '@ui5/webcomponents-react';
import { Label } from '../../shared/ResourceForm/components/Label';

export function MemoryInput({
  label,
  propertyPath,
  container = {},
  setContainer,
  required,
  className,
  ...otherProps
}) {
  const units = ['K', 'Ki', 'M', 'Mi', 'G', 'Gi', 'Ti', 'T'];
  const options = [
    { key: '', text: 'B' },
    ...units.map(e => ({
      key: e,
      text: e,
    })),
  ];

  const value = jp.value(container, propertyPath)?.toString() || '';
  const numericValue = value.match(/^\d*(\.\d*)?/)[0];
  const unit = value.replace(numericValue, '');
  const selectedUnit = units.includes(unit) ? unit : '';

  const setValue = val => {
    jp.value(container, propertyPath, val);
    setContainer({ ...container });
  };
  if (!otherProps.readOnly) delete otherProps.readOnly;
  return (
    <FlexBox
      direction="Column"
      style={{
        maxWidth: '100%',
      }}
    >
      <Label required={required}>{label}</Label>
      <FlexBox style={{ gap: '10px' }} className={className}>
        <Input
          type="Number"
          min="0"
          required={required}
          value={numericValue}
          onInput={e => setValue(e.target.value + selectedUnit)}
          className="full-width"
          {...otherProps}
        />
        <Dropdown
          options={options}
          required={required}
          selectedKey={selectedUnit}
          onSelect={(_, { key }) => setValue(numericValue.toString() + key)}
          {...otherProps}
        />
      </FlexBox>
    </FlexBox>
  );
}

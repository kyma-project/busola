import React from 'react';
import { FormRadioGroup, Checkbox } from 'fundamental-react';

export function Checkboxes({
  value = [],
  setValue,
  options,
  inline,
  dataTestID,
  ...props
}) {
  const updateValue = (key, checked) => {
    if (checked) {
      setValue([...(value || []), key]);
    } else {
      setValue(value.filter(v => v !== key));
    }
  };
  return (
    <div class="fd-col fd-col-md--11">
      <FormRadioGroup inline={inline} className="inline-radio-group" {...props}>
        {options.map(({ key, text }) => (
          <Checkbox
            data-testid={`${dataTestID}.${key}`}
            compact
            key={key}
            value={key}
            checked={value?.includes(key)}
            onChange={e => updateValue(key, e.target.checked)}
          >
            {text}
          </Checkbox>
        ))}
      </FormRadioGroup>
    </div>
  );
}

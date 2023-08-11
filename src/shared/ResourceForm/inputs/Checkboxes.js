import React from 'react';
import { Checkbox, FormRadioGroup, Icon } from 'fundamental-react';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';

export function Checkboxes({
  value = [],
  setValue,
  options,
  inline,
  dataTestID,
  inputRef,
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
    <FormRadioGroup
      inline={inline}
      className="inline-radio-group fd-col fd-col-md--12"
      {...props}
    >
      <input
        ref={inputRef}
        style={{ opacity: 0, position: 'absolute', left: '-1000px' }}
      />
      {options.map(({ key, text, description }, index) => (
        <div key={key} className="fd-row">
          <div>
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
          </div>
          <div className="fd-col fd-col-md--1 tooltip-column">
            {description && (
              <Tooltip className="has-tooltip" delay={0} content={description}>
                <Icon ariaLabel="" size="m" glyph="message-information" />
              </Tooltip>
            )}
          </div>
        </div>
      ))}
    </FormRadioGroup>
  );
}

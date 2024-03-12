import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { CheckBox, FlexBox, Icon } from '@ui5/webcomponents-react';

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
    <>
      {options.map(({ key, text, description }) => (
        <FlexBox wrap="Wrap" alignItems="Center" key={key}>
          <CheckBox
            data-testid={`${dataTestID}.${key}`}
            checked={value?.includes(key)}
            onChange={e => updateValue(key, e.target.checked)}
            text={text}
          />
          <div className="bsl-col-md--1 tooltip-column">
            {description && (
              <Tooltip className="has-tooltip" delay={0} content={description}>
                <Icon
                  className="bsl-icon-m"
                  name="message-information"
                  design="Information"
                />
              </Tooltip>
            )}
          </div>
        </FlexBox>
      ))}
    </>
  );
}

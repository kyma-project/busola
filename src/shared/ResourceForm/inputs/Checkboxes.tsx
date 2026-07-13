import { CheckBox, FlexBox, Icon } from '@ui5/webcomponents-react';

type Option = {
  key: string;
  text: string;
  description?: string;
};

type CheckboxesProps = {
  value?: string[];
  setValue: (value: string[]) => void;
  options: Option[];
  dataTestID: string;
};

export function Checkboxes({
  value = [],
  setValue,
  options,
  dataTestID,
}: CheckboxesProps) {
  const updateValue = (key: string, checked: boolean) => {
    if (checked) {
      setValue([...(value || []), key]);
    } else {
      setValue(value.filter((v) => v !== key));
    }
  };
  return (
    <>
      {options.map(({ key, text, description }) => (
        <FlexBox wrap="Wrap" alignItems="Center" key={key}>
          <CheckBox
            accessibleName={text}
            data-testid={`${dataTestID}.${key}`}
            checked={value?.includes(key)}
            onChange={(e) => updateValue(key, e.target.checked)}
            text={text}
          />
          {description && (
            <Icon
              className="bsl-icon-m"
              name="message-information"
              design="Information"
              title={description}
            />
          )}
        </FlexBox>
      ))}
    </>
  );
}

import { MultiInput } from './MultiInput';
import { Input } from '@ui5/webcomponents-react';

type TextArrayInputProps = {
  defaultOpen?: boolean;
  inputProps?: { [key: string]: any };
  sectionTooltipContent?: React.ReactNode;
  placeholder?: string;
  toInternal?: (value: any) => string[];
  toExternal?: (value: string[]) => any;
  readOnly?: boolean;
  ariaLabel?: string;
  [key: string]: any;
};

export function TextArrayInput({
  defaultOpen,
  inputProps: _inputProps,
  sectionTooltipContent,
  placeholder,
  toInternal = (value) => value || [],
  toExternal = (value) => value.filter((val) => typeof val === 'string'),
  readOnly,
  ariaLabel,
  ...props
}: TextArrayInputProps) {
  const { ...inputProps } = _inputProps || {};
  const readOnlyOptions = readOnly ? { readOnly: true } : {};

  return (
    <MultiInput
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      sectionTooltipContent={sectionTooltipContent}
      readOnly={readOnly}
      inputs={[
        ({ value, setValue, ref, updateValue, index }: any) => (
          <Input
            placeholder={Math.abs(index) === 1 ? placeholder : ''}
            key={index}
            value={value || ''}
            ref={ref}
            onInput={(e) => {
              setValue(e.target.value);
              updateValue();
            }}
            className="full-width"
            {...readOnlyOptions}
            {...inputProps}
            accessibleName={ariaLabel}
          />
        ),
      ]}
      {...props}
    />
  );
}

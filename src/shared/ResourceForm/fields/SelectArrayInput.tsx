import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';

type SelectArrayInputProps = {
  title?: string;
  defaultOpen?: boolean;
  placeholder?: string;
  tooltipContent?: React.ReactNode;
  sectionTooltipContent?: React.ReactNode;
  options: { key: string; text: string }[];
  [key: string]: any;
};

export function SelectArrayInput({
  title,
  defaultOpen,
  placeholder,
  tooltipContent,
  sectionTooltipContent,
  options,
  ...props
}: SelectArrayInputProps) {
  const toInternal = (values: []) => (values || []).filter((v) => v);

  const toExternal = (values: []) => values.filter((val) => !!val);

  return (
    /*@ts-expect-error Type mismatch between js and ts*/
    <MultiInput
      title={title}
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      inputs={[
        ({ value, setValue, ref, updateValue, focus, index }: any) => (
          /*@ts-expect-error Type mismatch between js and ts*/
          <Inputs.Dropdown
            key={index}
            placeholder={placeholder}
            _ref={ref}
            value={value}
            setValue={setValue}
            options={options}
            onKeyDown={focus}
            onBlur={updateValue}
            className="sap-margin-end-small"
          />
        ),
      ]}
      {...props}
    />
  );
}

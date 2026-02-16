import { useTranslation } from 'react-i18next';

import { MultiInput } from './MultiInput';
import * as Inputs from '../inputs';
import './ComboboxArrayInput.scss';

type ComboboxArrayInputProps = {
  title?: string;
  defaultOpen?: boolean;
  placeholder?: string;
  tooltipContent?: React.ReactNode;
  sectionTooltipContent?: React.ReactNode;
  options: { key: string; text: string }[];
  emptyStringKey?: string;
  onBlur?: () => void;
  noEdit?: boolean;
} & Record<string, any>;

export function ComboboxArrayInput({
  title,
  defaultOpen,
  placeholder,
  tooltipContent,
  sectionTooltipContent,
  options,
  emptyStringKey,
  onBlur,
  noEdit,
  ...props
}: ComboboxArrayInputProps) {
  const { t } = useTranslation();

  placeholder =
    placeholder || t('common.messages.type-to-select', { value: title });

  /*
    as original Combobox (and React's 'input' element) doesn't like '' for a key,
    we replace it with 'emptyStringKey' internal MultiInput state

    {key: '', text: 'empty'} -> {key: emptyStringKey, text: 'empty'}
  */
  const toInternal = (values: []) =>
    (values || [])
      .filter((v) => v || (emptyStringKey && v === ''))
      .map((v) => (emptyStringKey && v === '' ? emptyStringKey : v));

  const toExternal = (values: []) =>
    (values || [])
      .filter((val) => !!val)
      .map((v) => (emptyStringKey && v === emptyStringKey ? '' : v));

  return (
    <MultiInput
      title={title}
      noEdit={noEdit}
      defaultOpen={defaultOpen}
      toInternal={toInternal}
      toExternal={toExternal}
      tooltipContent={tooltipContent}
      sectionTooltipContent={sectionTooltipContent}
      className="combobox-array-input"
      inputs={[
        ({ value, setValue, ref, updateValue, focus, index }: any) => {
          return (
            /*@ts-expect-error Type mismatch between js and ts*/
            <Inputs.ComboboxInput
              updatesOnInput={false}
              key={index}
              placeholder={placeholder}
              _ref={ref}
              value={value}
              selectedKey={value}
              setValue={setValue}
              options={options}
              onKeyDown={focus}
              onBlur={onBlur}
              fullWidth
              onSelectionChange={(
                _: any,
                selected: { key: any; text: any },
              ) => {
                if ((noEdit && !selected) || selected.key === -1) {
                  return;
                }
                if (!selected.text) {
                  setValue(null);
                  updateValue(null);
                }
                const selection =
                  selected.key !== -1 ? selected.key : selected.text;
                setValue(selection);
                updateValue(selection);
              }}
            />
          );
        },
      ]}
      {...props}
    />
  );
}

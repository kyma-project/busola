import React from 'react';
import {
  FormInput,
  Switch as FRSwitch,
  FormRadioGroup,
  Checkbox,
} from 'fundamental-react';
import { Dropdown as BusolaDropown } from 'react-shared';
import { useTranslation } from 'react-i18next';

export function Text({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
}

export function Number({ value, setValue, ...props }) {
  return (
    <FormInput
      compact
      type="number"
      value={value}
      onChange={e => setValue(e.target.valueAsNumber || null)}
      {...props}
    />
  );
}

export function Switch({ value, setValue, ...props }) {
  return (
    <FRSwitch
      compact
      onChange={e => setValue(!value)}
      checked={value}
      {...props}
    />
  );
}

export function Dropdown({ value, setValue, error, loading, ...props }) {
  const { t, i18n } = useTranslation();

  const getValidationState = () => {
    if (error) {
      return {
        state: 'error',
        text: t('common.messages.error', { error: error.message }),
      };
    } else if (loading) {
      return {
        state: 'information',
        text: t('common.headers.loading'),
      };
    } else {
      return null;
    }
  };

  return (
    <BusolaDropown
      compact
      fullWidth
      selectedKey={value}
      onSelect={(_, selected) => setValue(selected.key, selected)}
      i18n={i18n}
      validationState={getValidationState()}
      {...props}
    />
  );
}

export function Checkboxes({ value, setValue, options, inline, ...props }) {
  const updateValue = (key, checked) => {
    if (checked) {
      setValue([...(value || []), key]);
    } else {
      setValue(value.filter(v => v !== key));
    }
  };

  return (
    <FormRadioGroup inline={inline} className="inline-radio-group" {...props}>
      {options.map(({ key, text }) => (
        <Checkbox
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
  );
}

export function Port({ ...props }) {
  return <Number min={0} max={65535} {...props} />;
}

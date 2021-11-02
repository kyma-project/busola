import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormItem,
  FormInput,
  FormLabel,
  FormFieldset,
} from 'fundamental-react';
import * as jp from 'jsonpath';

import { Dropdown } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

function MemoryInput({ label, propertyPath, container = {}, setContainer }) {
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
    setContainer(container);
  };

  return (
    <FormItem>
      <FormLabel required>{label}</FormLabel>
      <div className="memory-input">
        <FormInput
          compact
          type="number"
          min="0"
          required
          value={numericValue}
          onChange={e => setValue(e.target.value + selectedUnit)}
        />
        <Dropdown
          compact
          options={options}
          selectedKey={selectedUnit}
          onSelect={(_, { key }) => setValue(numericValue.toString() + key)}
        />
      </div>
    </FormItem>
  );
}

function CpuInput({ label, propertyPath, container = {}, setContainer }) {
  let value = jp.value(container, propertyPath)?.toString() || '';
  if (value.endsWith('m')) {
    value = value.replace(/m/, '');
  } else {
    // convert from full units to milis
    value *= 1000;
  }

  const setValue = val => {
    jp.value(container, propertyPath, val);
    setContainer(container);
  };

  return (
    <FormItem>
      <FormLabel required>{label} (m)</FormLabel>
      <Inputs.Number
        min="0"
        required
        value={value}
        setValue={value => setValue(value + 'm')}
      />
    </FormItem>
  );
}

export function RuntimeResources({ value, setValue, ...props }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.CollapsibleSection
      // canChangeState={false}
      {...props}
    >
      <FormFieldset className="runtime-profile-form">
        <MemoryInput
          label={t('deployments.create-modal.advanced.memory-requests')}
          propertyPath="$.requests.memory"
          container={value}
          setContainer={setValue}
        />
        <MemoryInput
          label={t('deployments.create-modal.advanced.memory-limits')}
          propertyPath="$.limits.memory"
          container={value}
          setContainer={setValue}
        />
      </FormFieldset>
      <FormFieldset className="runtime-profile-form">
        <CpuInput
          label={t('deployments.create-modal.advanced.cpu-requests')}
          propertyPath="$.requests.cpu"
          container={value}
          setContainer={setValue}
        />
        <CpuInput
          label={t('deployments.create-modal.advanced.cpu-limits')}
          propertyPath="$.limits.cpu"
          container={value}
          setContainer={setValue}
        />
      </FormFieldset>
    </ResourceForm.CollapsibleSection>
  );
}

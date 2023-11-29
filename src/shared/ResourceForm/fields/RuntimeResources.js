import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { ResourceForm } from '..';
import * as Inputs from '../inputs';
import { FlexBox } from '@ui5/webcomponents-react';
import { Label } from '../../../shared/ResourceForm/components/Label';
import { MemoryInput } from 'resources/Namespaces/MemoryQuotas';
import './RuntimeResources.scss';

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
    <FlexBox
      direction="Column"
      style={{
        maxWidth: '100%',
      }}
    >
      <Label required>{label} (m)</Label>
      <Inputs.Number
        min="0"
        value={value}
        setValue={value => setValue(value + 'm')}
        className="full-width"
        required
      />
    </FlexBox>
  );
}

export function RuntimeResources({
  value,
  setValue,
  presets,
  nestingLevel = 0,
  ...props
}) {
  const { t } = useTranslation();

  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => ({
      name: `${preset} (${Object.entries(values)
        .map(([t, v]) => `${t}: ${v}`)
        .join(', ')})`,
      value: {
        limits: {
          cpu: values.limitCpu,
          memory: values.limitMemory,
        },
        requests: {
          cpu: values.requestCpu,
          memory: values.requestMemory,
        },
      },
    }),
  );

  return (
    <ResourceForm.CollapsibleSection
      nestingLevel={nestingLevel}
      actions={
        presets && (
          <ResourceForm.Presets
            presets={mappedPresets}
            onSelect={preset => setValue(preset.value)}
          />
        )
      }
      {...props}
    >
      <div className="runtime-profile-form">
        <MemoryInput
          label={t('deployments.create-modal.advanced.memory-requests')}
          propertyPath="$.requests.memory"
          container={value}
          setContainer={setValue}
          required={true}
          className="bsl-col bsl-col-md--11"
        />
        <MemoryInput
          label={t('deployments.create-modal.advanced.memory-limits')}
          propertyPath="$.limits.memory"
          container={value}
          setContainer={setValue}
          required={true}
          className="bsl-col bsl-col-md--11"
        />
      </div>
      <div className="runtime-profile-form">
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
      </div>
    </ResourceForm.CollapsibleSection>
  );
}

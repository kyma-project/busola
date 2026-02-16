import { useTranslation } from 'react-i18next';
import jp from 'jsonpath';
import { ResourceForm } from '..';
import * as Inputs from '../inputs';
import { FlexBox } from '@ui5/webcomponents-react';
import { Label } from '../components/Label';
import { MemoryInput } from 'resources/Namespaces/MemoryQuotas';

import './RuntimeResources.scss';

type CpuInputProps = {
  label: string;
  propertyPath: string;
  container?: Record<string, any>;
  setContainer: (container: Record<string, any>) => void;
};

type RuntimeResourcesProps = {
  value: Record<string, any>;
  setValue: (value: Record<string, any>) => void;
  presets?: Record<
    string,
    {
      requestCpu: string;
      limitCpu: string;
      requestMemory: string;
      limitMemory: string;
    }
  >;
  nestingLevel?: number;
  title: string | JSX.Element;
};

function CpuInput({
  label,
  propertyPath,
  container = {},
  setContainer,
}: CpuInputProps) {
  let value = jp.value(container, propertyPath)?.toString() || '';
  if (value.endsWith('m')) {
    value = value.replace(/m/, '');
  } else {
    // convert from full units to milis
    value *= 1000;
  }

  const setValue = (val: string) => {
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
        setValue={(value: number | null) => setValue(value + 'm')}
        className="full-width"
        required
        accessibleName={label}
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
}: RuntimeResourcesProps) {
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
            onSelect={(preset) => setValue(preset.value)}
          />
        )
      }
      {...props}
    >
      <div className="runtime-profile-form sap-margin-top-tiny">
        <MemoryInput
          label={t('deployments.create-modal.memory-requests')}
          propertyPath="$.requests.memory"
          container={value}
          setContainer={setValue}
          required={true}
          className="bsl-col-md--12"
        />
        <MemoryInput
          label={t('deployments.create-modal.memory-limits')}
          propertyPath="$.limits.memory"
          container={value}
          setContainer={setValue}
          required={true}
          className="bsl-col-md--12"
        />
      </div>
      <div className="runtime-profile-form sap-margin-top-tiny">
        <CpuInput
          label={t('deployments.create-modal.cpu-requests')}
          propertyPath="$.requests.cpu"
          container={value}
          setContainer={setValue}
        />
        <CpuInput
          label={t('deployments.create-modal.cpu-limits')}
          propertyPath="$.limits.cpu"
          container={value}
          setContainer={setValue}
        />
      </div>
    </ResourceForm.CollapsibleSection>
  );
}

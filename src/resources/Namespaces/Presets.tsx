import { Presets } from 'shared/ResourceForm/components/Presets';
import { createResourceQuotaTemplate } from 'resources/ResourceQuotas/templates';
import { createLimitRangeTemplate } from 'resources/LimitRanges/templates';

export type LimitPresetsProps = {
  presets: Record<string, any>;
  setValue: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  namespaceName: string;
  disabled: boolean;
};

export const LimitPresets = ({
  presets,
  setValue,
  namespaceName,
  disabled,
}: LimitPresetsProps) => {
  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => {
      return {
        name: `${preset} (${Object.entries(values)
          .map(([t, v]) => `${t}: ${v}`)
          .join(', ')})`,
        value: createLimitRangeTemplate({
          max: values.max,
          defaultVal: values.default,
          defaultRequest: values.defaultRequest,
          name: `${namespaceName}-limits`,
          namespaceName,
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={(preset) => setValue(preset.value)}
      inlinePresets={true}
      disabled={disabled}
    />
  ) : null;
};

export type MemoryPresetsProps = {
  presets: object;
  setValue: React.SetStateAction<any>;
  namespaceName: string;
  disabled: boolean;
};

export const MemoryPresets = ({
  presets,
  setValue,
  namespaceName,
  disabled,
}: MemoryPresetsProps) => {
  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => {
      return {
        name: `${preset} (${Object.entries(values)
          .map(([t, v]) => `${t}: ${v}`)
          .join(', ')})`,
        value: createResourceQuotaTemplate({
          limits: values.limits,
          requests: values.requests,
          name: `${namespaceName}-quotas`,
          namespaceName,
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={(preset) => setValue(preset.value)}
      inlinePresets={true}
      disabled={disabled}
    />
  ) : null;
};

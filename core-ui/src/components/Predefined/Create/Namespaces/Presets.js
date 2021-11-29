import React from 'react';
import { Presets } from 'shared/ResourceForm/components/Presets';
import { createLimitsTemplate, createMemoryQuotasTemplate } from './templates';

export const LimitPresets = ({
  presets,
  value,
  setValue,
  namespaceName,
  ...otherProps
}) => {
  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => {
      return {
        name: `${preset} (${Object.entries(values)
          .map(([t, v]) => `${t}: ${v}`)
          .join(', ')})`,
        value: createLimitsTemplate({
          max: values.max,
          defaultVal: values.default,
          defaultRequest: values.defaultRequest,
          namespaceName,
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={preset => setValue(preset.value)}
      {...otherProps}
    />
  ) : null;
};

export const MemoryPresets = ({
  presets,
  value,
  setValue,
  namespaceName,
  ...otherProps
}) => {
  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => {
      return {
        name: `${preset} (${Object.entries(values)
          .map(([t, v]) => `${t}: ${v}`)
          .join(', ')})`,
        value: createMemoryQuotasTemplate({
          limits: values.limits,
          requests: values.requests,
          namespaceName,
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={preset => setValue(preset.value)}
      {...otherProps}
    />
  ) : null;
};

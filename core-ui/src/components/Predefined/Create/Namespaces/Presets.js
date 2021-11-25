import React from 'react';
import { Presets } from 'shared/ResourceForm/components/Presets';
import { createLimitsTemplate, createMemoryQuotasTemplate } from './templates';

export const LimitPresets = ({ presets, value, setValue }) => {
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
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={preset => setValue(preset.value)}
    />
  ) : null;
};

export const MemoryPresets = ({ presets, value, setValue }) => {
  const mappedPresets = Object.entries(presets || {}).map(
    ([preset, values]) => {
      return {
        name: `${preset} (${Object.entries(values)
          .map(([t, v]) => `${t}: ${v}`)
          .join(', ')})`,
        value: createMemoryQuotasTemplate({
          limits: values.limits,
          requests: values.requests,
        }),
      };
    },
  );

  return presets ? (
    <Presets
      presets={mappedPresets}
      onSelect={preset => setValue(preset.value)}
    />
  ) : null;
};

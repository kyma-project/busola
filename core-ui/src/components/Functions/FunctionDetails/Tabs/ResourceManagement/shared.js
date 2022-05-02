import React from 'react';
import * as yup from 'yup';

import {
  CPU_REGEXP,
  MEMORY_REGEXP,
  normalizeCPU,
  normalizeMemory,
  compareCpu,
  compareMemory,
} from 'components/Functions/helpers/resources';
import { CONFIG } from 'components/Functions/config';

export const inputClassName = 'fd-input resource_input';
export const errorClassName = 'error_message';
export const customPreset = 'custom';

export const inputNames = {
  replicas: {
    preset: 'replicasLabel',
    min: 'minReplicas',
    max: 'maxReplicas',
  },
  function: {
    preset: 'functionPresetLabel',
    requests: {
      cpu: 'functionRequestsCpu',
      memory: 'functionRequestsMemory',
    },
    limits: { cpu: 'functionLimitsCpu', memory: 'functionLimitsMemory' },
  },
  buildJob: {
    preset: 'buildPresetLabel',
    requests: {
      cpu: 'buildRequestsCpu',
      memory: 'buildRequestsMemory',
    },
    limits: { cpu: 'buildLimitsCpu', memory: 'buildLimitsMemory' },
  },
};

export function ErrorMessage({ errors = {}, field = '' }) {
  return errors[field]?.message ? (
    <div className={errorClassName}>{errors[field].message}</div>
  ) : null;
}

export function prepareSchema(t) {
  const MIN_MEMORY_VALUE_ERROR = (type = 'function') =>
    t('functions.create-view.errors.memory-too-low', {
      minValue: CONFIG[`${type}MinResources`]?.memory || '',
    });
  const MIN_CPU_VALUE_ERROR = (type = 'function') =>
    t('functions.create-view.errors.cpu-default', {
      minValue: CONFIG[`${type}MinResources`]?.cpu || '',
    });

  return yup.object().shape({
    [inputNames.replicas.min]: yup
      .number()
      .transform((val, originalVal) => {
        return originalVal === '' ? -1 : val; // -1 so that instead of throwing errors about NaN it will pass validation here, but fail on min(0) with nicer error message
      })
      .positive(t('functions.create-view.errors.min-replicas-positive'))
      .integer(t('functions.create-view.errors.min-replicas-positive'))
      .test(
        'matchMinReplicas',
        t('functions.create-view.errors.min-replicas-too-high'),
        function(arg) {
          return arg <= this.parent.maxReplicas;
        },
      ),
    [inputNames.replicas.max]: yup
      .number()
      .transform((val, originalVal) => {
        return originalVal === '' ? -1 : val; // -1 so that instead of throwing errors about NaN it will pass validation here, but fail on min(0) with nicer error message
      })
      .positive(t('functions.create-view.errors.max-replicas-positive'))
      .integer(t('functions.create-view.errors.max-replicas-positive'))
      .test(
        'matchMaxReplicas',
        t('functions.create-view.errors.max-replicas-too-low'),
        function(arg) {
          return arg >= this.parent.minReplicas;
        },
      ),

    // FUNCTION
    [inputNames.function.preset]: yup.string(),
    [inputNames.function.requests.cpu]: yup
      .string()
      .matches(CPU_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.cpu-default'),
      })
      .test('matchFunctionMinRequestCPU', MIN_CPU_VALUE_ERROR(), function(arg) {
        return testMinCPU(arg);
      })
      .test(
        'matchFunctionRequestCPU',
        t('functions.create-view.errors.cpu-request-too-high'),
        function(arg) {
          const normalizedLimit = normalizeCPU(this.parent.functionLimitsCpu);
          if (!normalizedLimit) {
            return true;
          }

          const normalizedRequest = normalizeCPU(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.function.limits.cpu]: yup
      .string()
      .matches(CPU_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.cpu-default'),
      })
      .test('matchFunctionMinLimitCPU', MIN_CPU_VALUE_ERROR(), function(arg) {
        return testMinCPU(arg);
      })
      .test(
        'matchFunctionLimitCPU',
        t('functions.create-view.errors.cpu-limits-too-low'),
        function(arg) {
          if (!arg) {
            return true;
          }
          const normalizedRequest = normalizeCPU(
            this.parent.functionRequestsCpu,
          );
          const normalizedLimit = normalizeCPU(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.function.requests.memory]: yup
      .string()
      .matches(MEMORY_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.memory-default'),
      })
      .test('matchFunctionMinRequestMemory', MIN_MEMORY_VALUE_ERROR(), function(
        arg,
      ) {
        return testMinMemory(arg);
      })
      .test(
        'matchFunctionRequestMemory',
        t('functions.create-view.errors.memory-request-too-high'),
        function(arg) {
          const normalizedLimit = normalizeMemory(
            this.parent.functionLimitsMemory,
          );
          if (!normalizedLimit) {
            return true;
          }

          const normalizedRequest = normalizeMemory(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.function.limits.memory]: yup
      .string()
      .matches(MEMORY_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.memory-default'),
      })
      .test('matchFunctionMinLimitMemory', MIN_MEMORY_VALUE_ERROR(), function(
        arg,
      ) {
        return testMinMemory(arg);
      })
      .test(
        'matchFunctionLimitMemory',
        t('functions.create-view.errors.memory-limits-too-low'),
        function(arg) {
          if (!arg) {
            return true;
          }

          const normalizedRequest = normalizeMemory(
            this.parent.functionRequestsMemory,
          );
          const normalizedLimit = normalizeMemory(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),

    // BUILD_JOB
    [inputNames.buildJob.preset]: yup.string(),
    [inputNames.buildJob.requests.cpu]: yup
      .string()
      .matches(CPU_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.cpu-default'),
      })
      .test(
        'matchBuildMinRequestCPU',
        MIN_CPU_VALUE_ERROR('buildJob'),
        function(arg) {
          return testMinCPU(arg, 'buildJob');
        },
      )
      .test(
        'matchBuildRequestCPU',
        t('functions.create-view.errors.cpu-request-too-high'),
        function(arg) {
          const normalizedLimit = normalizeCPU(this.parent.buildLimitsCpu);
          if (!normalizedLimit) {
            return true;
          }

          const normalizedRequest = normalizeCPU(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.buildJob.limits.cpu]: yup
      .string()
      .matches(CPU_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.cpu-default'),
      })
      .test('matchBuildMinLimitCPU', MIN_CPU_VALUE_ERROR('buildJob'), function(
        arg,
      ) {
        return testMinCPU(arg, 'buildJob');
      })
      .test(
        'matchBuildLimitCPU',
        t('functions.create-view.errors.cpu-limits-too-low'),
        function(arg) {
          if (!arg) {
            return true;
          }
          const normalizedRequest = normalizeCPU(this.parent.buildRequestsCpu);
          const normalizedLimit = normalizeCPU(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.buildJob.requests.memory]: yup
      .string()
      .matches(MEMORY_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.memory-default'),
      })
      .test(
        'matchBuildMinRequestMemory',
        MIN_MEMORY_VALUE_ERROR('buildJob'),
        function(arg) {
          return testMinMemory(arg, 'buildJob');
        },
      )
      .test(
        'matchBuildRequestMemory',
        t('functions.create-view.errors.memory-request-too-high'),
        function(arg) {
          const normalizedLimit = normalizeMemory(
            this.parent.buildLimitsMemory,
          );
          if (!normalizedLimit) {
            return true;
          }

          const normalizedRequest = normalizeMemory(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
    [inputNames.buildJob.limits.memory]: yup
      .string()
      .matches(MEMORY_REGEXP, {
        excludeEmptyString: true,
        message: t('functions.create-view.errors.memory-default'),
      })
      .test(
        'matchBuildMinLimitMemory',
        MIN_MEMORY_VALUE_ERROR('buildJob'),
        function(arg) {
          return testMinMemory(arg, 'buildJob');
        },
      )
      .test(
        'matchBuildLimitMemory',
        t('functions.create-view.errors.memory-limits-too-low'),
        function(arg) {
          if (!arg) {
            return true;
          }

          const normalizedRequest = normalizeMemory(
            this.parent.buildRequestsMemory,
          );
          const normalizedLimit = normalizeMemory(arg);
          return normalizedRequest <= normalizedLimit;
        },
      ),
  });
}

function testMinCPU(arg, type = 'function') {
  if (!arg) {
    return true;
  }
  return compareCpu(CONFIG[`${type}MinResources`]?.cpu, arg);
}

function testMinMemory(arg, type = 'function') {
  if (!arg) {
    return true;
  }
  return compareMemory(CONFIG[`${type}MinResources`]?.memory, arg);
}

export function checkReplicasPreset(min, max, presets) {
  const possiblePreset = Object.entries(presets).find(([_, values]) => {
    return values.min === min && values.max === max;
  });
  if (possiblePreset) {
    return possiblePreset[0];
  }
  return customPreset;
}

export function checkResourcesPreset(functionResources, presets) {
  const possiblePreset = Object.entries(presets).find(([_, values]) => {
    return (
      values?.requestMemory === functionResources?.requests?.memory &&
      values?.requestCpu === functionResources?.requests?.cpu &&
      values?.limitMemory === functionResources?.limits?.memory &&
      values?.limitCpu === functionResources?.limits?.cpu
    );
  });
  if (possiblePreset) {
    return possiblePreset[0];
  }
  return customPreset;
}

export function isCustomPreset(preset) {
  return preset === customPreset;
}

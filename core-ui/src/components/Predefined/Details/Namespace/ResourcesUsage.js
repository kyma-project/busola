import React from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';
import { camelCase } from 'lodash';

import { Panel, LayoutGrid } from 'fundamental-react';
import { useGetList, useGet, Spinner, CircleProgress } from 'react-shared';

const MEMORY_SUFFIX_POWER = {
  // must be sorted from the smallest to the largest
  m: 1e-3,
  K: 1e3,
  Ki: 2 ** 10,
  M: 1e6,
  Mi: 2 ** 20,
  G: 1e9,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
};

function getBytes(memoryString) {
  const suffixMatch = memoryString.match(/\D+$/);

  if (!suffixMatch?.length) {
    console.warn('error');
    return;
  }
  const suffix = suffixMatch[0];
  const number = memoryString.replace(suffix, '');

  const suffixPower = MEMORY_SUFFIX_POWER[suffix];
  if (!suffixPower) {
    console.warn('error');
    return;
  }

  return number * suffixPower;
}

function unitToPascalCase(str) {
  const firstLetter = str[0];
  return firstLetter.toUpperCase() + str.toLowerCase().slice(1);
}

function bytesToHumanReadable(bytesNumber) {
  let output = bytesNumber;
  Object.entries(MEMORY_SUFFIX_POWER).forEach(([suffix, power]) => {
    const value = bytesNumber / power;
    // console.log(power, value);
    if (value >= 1)
      output =
        Math.round((value + Number.EPSILON) * 100) / 100 +
        unitToPascalCase(suffix);
  });

  return output;
}

const MemoryRequestsCircle = ({ resourceQuotas, isLoading }) => {
  if (!resourceQuotas) {
    return `Error while loading memory consumption data`;
  } else if (isLoading) {
    return <Spinner />;
  }

  const totalLimits = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status.hard['requests.memory']), //should we sum it or take the max number?
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status.used['requests.memory']), //should we sum it or take the max number?
    0,
  );

  console.log(resourceQuotas);

  return (
    <CircleProgress
      color="var(--fd-color-accent-1)"
      value={totalUsage}
      valueText={bytesToHumanReadable(totalUsage)}
      max={totalLimits}
      maxText={bytesToHumanReadable(totalLimits)}
      title="Memory requests"
    />
  );
};

const MemoryLimitsCircle = ({ resourceQuotas, isLoading }) => {
  if (!resourceQuotas) {
    return `Error while loading memory consumption data`;
  } else if (isLoading) {
    return <Spinner />;
  }

  const totalLimits = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status.hard['limits.memory']), //should we sum it or take the max number?
    0,
  );
  const totalUsage = resourceQuotas.reduce(
    (sum, quota) => sum + getBytes(quota.status.used['limits.memory']), //should we sum it or take the max number?
    0,
  );

  return (
    <CircleProgress
      color="var(--fd-color-accent-2)"
      value={totalUsage}
      valueText={bytesToHumanReadable(totalUsage)}
      max={totalLimits}
      maxText={bytesToHumanReadable(totalLimits)}
      title="Memory limits"
    />
  );
};

export const ResourcesUsage = ({ namespace }) => {
  const { data: resourceQuotas, error, loading = true } = useGetList()(
    `/api/v1/namespaces/${namespace}/resourcequotas`,
    {
      pollingInterval: 3300,
    },
  );

  const { data } = useGet('/apis/metrics.k8s.io/');
  console.log('data');

  return (
    <Panel className="fd-has-margin-m">
      <Panel.Header>
        <Panel.Head title="Resource consumption" />
      </Panel.Header>
      <Panel.Body className="namespace-workloads__body">
        <LayoutGrid cols={2}>
          <MemoryRequestsCircle
            resourceQuotas={resourceQuotas}
            isLoading={loading}
          />
          <MemoryLimitsCircle
            resourceQuotas={resourceQuotas}
            isLoading={loading}
          />
        </LayoutGrid>
      </Panel.Body>
    </Panel>
  );
};

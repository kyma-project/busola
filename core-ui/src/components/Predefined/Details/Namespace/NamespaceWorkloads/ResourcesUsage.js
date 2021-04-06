import React from 'react';
import LuigiClient from '@luigi-project/client';
import PropTypes from 'prop-types';

import { Panel, LayoutGrid } from 'fundamental-react';
import { useGetList, Spinner, CircleProgress } from 'react-shared';

const MEMORY_SUFFIX_POWER = {
  KI: 10,
  MI: 20,
  GI: 30,
};

function getBytes(memoryString) {
  const suffixMatch = memoryString.match(/\wi$/);
  if (!suffixMatch?.length) {
    console.warn('error');
    return;
  }
  const suffix = suffixMatch[0];

  const number = memoryString.replace(suffix, '');

  const suffixPower = MEMORY_SUFFIX_POWER[suffix.toUpperCase()];
  if (!suffixPower) {
    console.warn('error');
    return;
  }

  return number * 2 ** suffixPower;
}

export const MemoryUsageCircle = ({ namespace }) => {
  const { data, error, loading = true } = useGetList()(
    '/api/v1/namespaces/resource-haver/resourcequotas',
    {
      pollingInterval: 3300,
    },
  );
  if (error) {
    return `Error while loading memory consumption data due to: ${error.message}`;
  } else if (loading || !data) {
    return <Spinner />;
  }

  console.log(data);

  const totalLimits = data.reduce(
    (sum, quota) => sum + getBytes(quota.status.hard['limits.memory']),
    0,
  );

  const totalUsage = data.reduce(
    (sum, quota) => sum + getBytes(quota.status.used['limits.memory']),
    0,
  );

  console.log(totalLimits);
  // getBytes('543463Mi');
  return (
    <CircleProgress
      color={'teal'}
      value={totalUsage}
      max={totalLimits}
      title="Memory consumption"
    />
  );
};

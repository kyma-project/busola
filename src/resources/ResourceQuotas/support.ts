import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
  getCpus,
} from 'resources/Namespaces/ResourcesUsage';
import { ResourceQuota } from './ResourceQuotaDetails';
import { roundTwoDecimals } from 'shared/utils/helpers';
import { calculateMetrics } from 'resources/Pods/podQueries';
import { UsageMetrics } from 'resources/Pods/types';
import { isEmpty } from 'lodash';

// It takes resource limits and requests and maps it to data suitable for charts to make it easier to iterate and render.
export const mapLimitsAndRequestsToChartsData = (resource?: ResourceQuota) => {
  if (isEmpty(resource?.status)) {
    return [];
  }

  const totalCpuLimits = getCpus(resource?.status?.hard?.['limits.cpu']);
  const totalUsageCpuLimits = getCpus(resource?.status?.used?.['limits.cpu']);
  const totalMemoryLimits = getBytes(resource?.status?.hard?.['limits.memory']);
  const totalUsageMemoryLimits = getBytes(
    resource?.status?.used?.['limits.memory'],
  );
  const totalCpuRequests = getCpus(resource?.status?.hard?.['requests.cpu']);
  const totalUsageCpuRequests = getCpus(
    resource?.status?.used?.['requests.cpu'],
  );
  const totalMemoryRequests = getBytes(
    resource?.status?.hard?.['requests.memory'] ??
      resource?.status?.hard?.memory,
  );
  const totalUsageMemoryRequests = getBytes(
    resource?.status?.used?.['requests.memory'] ??
      resource?.status?.used?.memory,
  );
  return [
    {
      headerTitle: 'cluster-overview.statistics.cpu-limits',
      value: totalUsageCpuLimits,
      max: totalCpuLimits,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${cpusToHumanReadable(totalUsageCpuLimits, {
        unit: 'm',
      })} / ${cpusToHumanReadable(totalCpuLimits, {
        unit: 'm',
      })}`,
    },
    {
      headerTitle: 'namespaces.overview.resources.limits',
      value: totalUsageMemoryLimits,
      max: totalMemoryLimits,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${bytesToHumanReadable(
        totalUsageMemoryLimits,
      )} / ${bytesToHumanReadable(totalMemoryLimits)}`,
    },
    {
      headerTitle: 'cluster-overview.statistics.cpu-requests',
      value: totalUsageCpuRequests,
      max: totalCpuRequests,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${cpusToHumanReadable(totalUsageCpuRequests, {
        unit: 'm',
      })} / ${cpusToHumanReadable(totalCpuRequests, {
        unit: 'm',
      })}`,
    },
    {
      headerTitle: 'namespaces.overview.resources.requests',
      value: totalUsageMemoryRequests,
      max: totalMemoryRequests,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${bytesToHumanReadable(
        totalUsageMemoryRequests,
      )} / ${bytesToHumanReadable(totalMemoryRequests)}`,
    },
  ];
};

// It takes pods metrics, calculates and maps it to data suitable for charts to make it easier to iterate and render.
export const mapUsagesToChartsData = (podsMetrics?: UsageMetrics[]) => {
  if (!podsMetrics?.length) {
    return [];
  }

  const { cpu, memory } = calculateMetrics(podsMetrics);
  return [
    {
      headerTitle: 'cluster-overview.statistics.cpu-usage',
      value: roundTwoDecimals(cpu.usage) as number,
      max: roundTwoDecimals(cpu.capacity) as number,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${cpusToHumanReadable(cpu.usage, {
        unit: 'm',
      })} / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' })}`,
    },
    {
      headerTitle: 'cluster-overview.statistics.memory-usage',
      value: roundTwoDecimals(memory.usage) as number,
      max: roundTwoDecimals(memory.capacity) as number,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${roundTwoDecimals(memory.usage)}Gi / ${roundTwoDecimals(
        memory.capacity,
      )}Gi`,
    },
  ];
};

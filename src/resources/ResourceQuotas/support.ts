import {
  bytesToHumanReadable,
  cpusToHumanReadable,
  getBytes,
  getCpus,
} from 'shared/helpers/resources';
import { ResourceQuota } from './ResourceQuotaDetails';
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
      tooltipInfo: 'cluster-overview.statistics.cpu-limits-tooltip',
      value: totalUsageCpuLimits,
      max: totalCpuLimits,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(totalUsageCpuLimits, {
          unit: 'm',
        }).string
      } / ${
        cpusToHumanReadable(totalCpuLimits, {
          unit: 'm',
        }).string
      }`,
    },
    {
      headerTitle: 'namespaces.overview.resources.limits',
      tooltipInfo: 'cluster-overview.statistics.memory-limits-tooltip',
      value: totalUsageMemoryLimits,
      max: totalMemoryLimits,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${
        bytesToHumanReadable(totalUsageMemoryLimits, {
          unit: 'Gi',
        }).string
      } / ${
        bytesToHumanReadable(totalMemoryLimits, {
          unit: 'Gi',
        }).string
      }`,
    },
    {
      headerTitle: 'cluster-overview.statistics.cpu-requests',
      tooltipInfo: 'cluster-overview.statistics.cpu-requests-tooltip',
      value: totalUsageCpuRequests,
      max: totalCpuRequests,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(totalUsageCpuRequests, {
          unit: 'm',
        }).string
      } / ${
        cpusToHumanReadable(totalCpuRequests, {
          unit: 'm',
        }).string
      }`,
    },
    {
      headerTitle: 'namespaces.overview.resources.requests',
      tooltipInfo: 'cluster-overview.statistics.memory-requests-tooltip',
      value: totalUsageMemoryRequests,
      max: totalMemoryRequests,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${
        bytesToHumanReadable(totalUsageMemoryRequests, {
          unit: 'Gi',
        }).string
      } / ${
        bytesToHumanReadable(totalMemoryRequests, {
          unit: 'Gi',
        }).string
      }`,
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
      tooltipInfo: 'cluster-overview.statistics.cpu-usage-tooltip',
      value: cpu.usage,
      max: cpu.capacity,
      color: 'var(--sapChart_OrderedColor_5)',
      additionalInfo: `${
        cpusToHumanReadable(cpu.usage, {
          unit: 'm',
        }).string
      } / ${cpusToHumanReadable(cpu.capacity, { unit: 'm' }).string}`,
    },
    {
      headerTitle: 'cluster-overview.statistics.memory-usage',
      tooltipInfo: 'cluster-overview.statistics.memory-usage-tooltip',
      value: memory.usage,
      max: memory.capacity,
      color: 'var(--sapChart_OrderedColor_6)',
      additionalInfo: `${
        bytesToHumanReadable(memory.usage, { unit: 'Gi' }).string
      } / ${bytesToHumanReadable(memory.capacity, { unit: 'Gi' }).string}`,
    },
  ];
};
